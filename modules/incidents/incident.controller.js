import Incident from "./incident.model.js";

export const createIncident = async (req, res) => {
  try {
    const incident = await Incident.create(req.body);

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find();

    res.json(incidents);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
