const baseController = async (req, res, next, controller) => {
  try {
    controller(req, res);
  } catch (error) {
    res.status(500).send(error);
    next(error);
  }
};
