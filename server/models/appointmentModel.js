import mongoose from "mongoose";

const normalizeTime = (timeStr) => {
  if (!timeStr) return timeStr;
  let match = timeStr.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (match) {
    let hour = parseInt(match[1]);
    let min = match[2] || "00";
    let period = match[3].toUpperCase();
    let hourStr = hour.toString().padStart(2, "0");
    return `${hourStr}:${min} ${period}`;
  }
  return timeStr.trim().toUpperCase();
};

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  docId: { type: String, required: true },
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true, set: normalizeTime },
  userData: { type: Object, required: true },
  docData: { type: Object, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  cancelled: { type: Boolean, default: false },
  payment: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
});

// DB-Level Strict Unique Constraint (Prevents double booking a doctor)
appointmentSchema.index({ docId: 1, slotDate: 1, slotTime: 1 }, { unique: true });

// DB-Level Strict Unique Constraint (Prevents a user from being in two places at once)
appointmentSchema.index({ userId: 1, slotDate: 1, slotTime: 1 }, { unique: true });

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
