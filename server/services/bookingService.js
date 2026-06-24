import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";

/**
 * Build slots_booked map from active (non-cancelled) appointments.
 * Appointments collection is the single source of truth for slot occupancy.
 */
export const getBookedSlotsForDoctor = async (docId) => {
  const appointments = await appointmentModel
    .find({ docId, cancelled: false })
    .select("slotDate slotTime");

  const slots_booked = {};
  for (const app of appointments) {
    if (!slots_booked[app.slotDate]) slots_booked[app.slotDate] = [];
    slots_booked[app.slotDate].push(app.slotTime);
  }
  return slots_booked;
};

/**
 * Create a new appointment.
 * @param {string} userId - ID of the user booking the appointment
 * @param {string} docId - ID of the doctor
 * @param {string} slotDate - Date of the slot (e.g., "10_07_2024")
 * @param {string} slotTime - Time of the slot (e.g., "10:00 AM")
 * @returns {Promise<Object>} The booked appointment data
 */
export const createAppointment = async (userId, docId, slotDate, slotTime) => {
  const docData = await doctorModel.findById(docId).select("-password");
  if (!docData) throw new Error("Doctor not found.");

  if (!docData.available) {
    throw new Error("Doctor not available. Please choose another doctor.");
  }

  const userData = await userModel.findById(userId).select("-password");
  if (!userData) throw new Error("User not found.");

  // We instantiate the model early. The Mongoose Schema's "set" function will automatically normalize the slotTime.
  const appointmentData = {
    userId,
    docId,
    userData,
    docData,
    amount: docData.fees,
    slotTime, // The raw string (e.g. "11 am")
    slotDate,
    date: Date.now(),
  };

  const newAppointment = new appointmentModel(appointmentData);
  
  const normalizedSlotTime = newAppointment.slotTime;

  const existingSlot = await appointmentModel.findOne({
    docId,
    slotDate,
    slotTime: normalizedSlotTime,
    cancelled: false,
  });
  if (existingSlot) {
    throw new Error("This slot is already booked.");
  }

  delete newAppointment.docData.slots_booked;

  try {
    await newAppointment.save();
  } catch (error) {
    if (error.code === 11000) {
      if (error.message.includes("userId_1")) {
        throw new Error("You already have another appointment scheduled at this exact date and time.");
      }
      throw new Error("This slot is already booked.");
    }
    throw error;
  }

  return newAppointment;
};

/**
 * Get all appointments for a user.
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} List of user's appointments
 */
export const getUserAppointments = async (userId) => {
  return await appointmentModel.find({ userId });
};

/**
 * Cancel an appointment.
 * @param {string} userId - ID of the user requesting cancellation
 * @param {string} appointmentId - ID of the appointment
 * @returns {Promise<boolean>} True if cancelled successfully
 */
export const cancelUserAppointment = async (userId, appointmentId) => {
  const appointmentData = await appointmentModel.findById(appointmentId);
  if (!appointmentData) {
    throw new Error("Appointment not found.");
  }

  // verify appointment user
  if (appointmentData.userId.toString() !== userId) {
    throw new Error("You are not authorized to cancel this appointment.");
  }

  await appointmentModel.findByIdAndUpdate(appointmentId, {
    cancelled: true,
  });

  return true;
};
