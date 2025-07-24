import { log } from "console";
import Schedule from "../models/scheduleSchema.js";

const getAll = async (req, res) => {
    console.log("Fetching all schedules");
    
  try {
    const schedules = await Schedule.find();
    res.status(200).json({ statusCode: 200, data: schedules });
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
};

const createSchedule = async (req, res) => {
  try {
    const novoAgendamento = new Schedule(req.body);
    const salvo = await novoAgendamento.save();
    res.status(201).json({
      statusCode: 201,
      message: "Agendamento criado com sucesso",
      data: salvo
    });
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await Schedule.findByIdAndDelete(id);
    res.status(200).json({ statusCode: 200, message: "Agendamento removido" });
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
};

export default {
  getAll,
  createSchedule,
  deleteSchedule
};
