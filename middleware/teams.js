
const { ticket } = require("../models");

const canAddUserToTeam = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    const availableTicket = await ticket.findOne({
      where: {
        user_id: req.user.user_id,
        participant_user_id: null
      }
    });

    if(availableTicket) {
      await ticket.update(
        { participant_user_id: user_id },
        {
          where: {
            ticket_id: availableTicket.ticket_id
          }
        }
      );

      return next();
    }

    return res.status(400).send({ message: 'Has alcanzado el maximo de miembros por equipo para este torneo.'})
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  canAddUserToTeam
}
