const {
  RESERVATION_NOT_FOUND,
  CLASS_FULL,
} = require("../constants/tickets");
const {
  ticket,
  event,
  event_type,
} = require("../models/");
const moment = require("moment");
const { Mutex } = require("async-mutex");
const { findAppConfigByKey } = require("../actions/appconfig");
const {
  findTicketById,
  enoughReservationTimeframe,
} = require("../actions/tickets");

const initialMutex = new Mutex();

let classLocks = [];

const getClassMutex = (event_id) => {
  const currentLock = classLocks.find((lock) => {
    return lock.event_id === event_id;
  });

  if (currentLock) {
    return currentLock.mutex;
  } else {
    const newMutex = new Mutex();

    classLocks.push({
      event_id,
      mutex: newMutex,
    });

    return classLocks[classLocks.length - 1].mutex;
  }
};

const canBook = async (req, res, next) => {
  try {
    const { class_date, event_id } = req.body;

    let current_event = await event.findOne({
      where: {
        event_id,
      },
      include: [
        {
          model: event_type,
          required: false,
        },
        {
          model: ticket,
          attributes: ["ticket_id", "user_id", "spot"],
        },
      ],
    });

    if (current_event === null) {
      return res.sendStatus(404);
    }

    current_event = current_event.toJSON();
    req.current_event = current_event;

    const reservationAvailable = await enoughReservationTimeframe(class_date);

    if (reservationAvailable !== true) {
      return res.status(412).send({ message: reservationAvailable });
    }

    res.status(412).send({
      message: `Lo sentimos, no tienes créditos suficientes para el tipo de clase: ${classTypeName}`,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error });
  }
};

const spotAvailable = async (req, res, next) => {
  let classMutex;
  let releaseClassMutex;
  try {
    const { current_event } = req;
    const { event_id, spot } = req.body;
    const releaseInitialMutex = await initialMutex.acquire();

    classMutex = getClassMutex(event_id);
    releaseClassMutex = await classMutex.acquire();
    req.mutex_release = releaseClassMutex;

    releaseInitialMutex();

    if (current_event === null) {
      releaseClassMutex();
      return res.sendStatus(404);
    }

    if (current_event.capacity !== null) {
      let remaining =
        current_event.capacity -
        current_event.tickets.length;
      if (remaining <= 0) {
        releaseClassMutex();
        return res.status(409).send({ message: CLASS_FULL });
      }
    }

    if (spot && spot !== null && spot !== "") {
      let spot_taken = current_event.tickets.find(
        (reservation) => String(reservation.spot) === String(spot)
      );
      if (spot_taken) {
        releaseClassMutex();

        return res
          .status(409)
          .send({ message: "Lo sentimos. Ese lugar ya ha sido ocupado." });
      }
    }
    next();
  } catch (error) {
    releaseClassMutex();
    next(error);
  }
};

const canCancel = async (req, res, next) => {
  try {
    const { ticket_id } = req.params;
    const timeFrameValue = await findAppConfigByKey("cancel_timeframe_value");
    const timeFrameUnit = await findAppConfigByKey("cancel_timeframe_unit");

    const cancelTimeFrame = {
      unit: timeFrameUnit.value,
      value: timeFrameValue.value,
    };

    let reservation = await findTicketById(ticket_id);

    if (reservation === null) {
      return res.status(404).send({ message: RESERVATION_NOT_FOUND });
    }

    const classHour = moment(reservation.event.class_date).utc();
    const currentHour = moment().utc();

    let diff = classHour.diff(currentHour, cancelTimeFrame.unit) + 6;

    let currentUnit = "";
    if (cancelTimeFrame.unit === "hours") currentUnit = "horas";
    if (cancelTimeFrame.unit === "minutes") currentUnit = "minutos";
    if (cancelTimeFrame.unit === "seconds") currentUnit = "segundos";

    if (diff < cancelTimeFrame.value) {
      return res.status(412).send({
        message: `Lo sentimos, para cancelar tu clase necesitas al menos ${cancelTimeFrame.value} ${currentUnit} de anticipación.`,
      });
    }

    next();
  } catch (error) {
    res.status(500).send({ error });
  }
};

module.exports = { canCancel, canBook, spotAvailable };
