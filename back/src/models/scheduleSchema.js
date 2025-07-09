import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    id: mongoose.Schema.Types.ObjectId,
    userId: {
      type: String,
      required: true,
    },
    medication: {
      type: String,
      required: true,
    },
    compartment: {
      type: Number,
      required: true,
    },
    time: {
      type: String,
      required: true,
    }, // formato: "08:30"
    days: {
      type: [String],
      required: true,
    }, // ex: ["seg", "qua", "sex"]
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Schedule", scheduleSchema);
