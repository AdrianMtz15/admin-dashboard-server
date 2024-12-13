const express = require("express");
const {
  getClaseAdminController,
  createEvent,
  updateEvent,
  deleteEvent,
  addUserEvent,
  getEventById,
  getClasesByWeeksAdminController,
  getAllEvents,
  getEventTypes,
  getUserEvents,
  getUserEventTickets,
  getAllEventsByFilters,
  createSubevent,
  updateEventFiles,
} = require("../controllers/event");
const { userAuth, isManager, isCoach } = require("../middleware/admin");
const { staffRoute, authRoute, } = require("../middleware/auth");
const router = express.Router();

router.get("/", getAllEvents);

router.get("/filters", getAllEventsByFilters);

router.get("/user", [authRoute], getUserEvents);

router.get("/single/user", [authRoute], getUserEventTickets);

router.get("/team", [authRoute], getUserEventTickets);

router.get("/types", getEventTypes);

router.get("/weeks/admin", [staffRoute, isCoach], getClasesByWeeksAdminController);

// router.get("/admin", [staffRoute, isCoach], getAllClasesAdminController);

router.get(
  "/single/:event_id",
  getEventById
);

router.get(
  "/admin/:event_id",
  [staffRoute, isCoach],
  getClaseAdminController
);

router.post("/", [staffRoute, isManager], createEvent);

router.post("/subevents", [staffRoute, isManager], createSubevent);

router.post("/asistente", [staffRoute, isManager], addUserEvent);

router.put("/", [staffRoute, isManager], updateEvent);

router.put("/files", [staffRoute, isManager], updateEventFiles);

router.put("/subevents", [staffRoute, isManager], updateEvent);

router.delete(
  "/:event_id",
  [staffRoute, isManager],
  deleteEvent
);

module.exports = router;
