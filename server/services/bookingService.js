import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";

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

  let slots_booked = docData.slots_booked || {};

  // check slot availability
  if (slots_booked[slotDate]) {
    if (slots_booked[slotDate].includes(slotTime)) {
      throw new Error("This slot is already booked.");
    } else {
      slots_booked[slotDate].push(slotTime);
    }
  } else {
    slots_booked[slotDate] = [];
    slots_booked[slotDate].push(slotTime);
  }

  const userData = await userModel.findById(userId).select("-password");
  if (!userData) throw new Error("User not found.");

  delete docData.slots_booked;

  const appointmentData = {
    userId,
    docId,
    userData,
    docData,
    amount: docData.fees,
    slotTime,
    slotDate,
    date: Date.now(),
  };

  const newAppointment = new appointmentModel(appointmentData);
  await newAppointment.save();

  // save new slots data in docData
  await doctorModel.findByIdAndUpdate(docId, { slots_booked });

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

  // cancel appointment
  await appointmentModel.findByIdAndUpdate(appointmentId, {
    cancelled: true,
  });

  // releasing doctor slot
  const { docId, slotDate, slotTime } = appointmentData;
  const doctorData = await doctorModel.findById(docId).select("-password");
  
  if (doctorData) {
    let slots_booked = doctorData.slots_booked || {};
    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(
        (time) => time !== slotTime
      );
      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    }
  }

  return true;
};
