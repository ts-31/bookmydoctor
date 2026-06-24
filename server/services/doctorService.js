import doctorModel from "../models/doctorModel.js";

/**
 * Fetch a list of doctors, optionally filtered by speciality.
 * @param {Object} [filters] - Optional filters like { speciality: "Dermatologist" }
 * @returns {Promise<Array>} List of doctors without password and email.
 */
export const getDoctorsList = async (filters = {}) => {
  const query = {};
  if (filters.speciality) {
    query.speciality = filters.speciality;
  }
  return await doctorModel.find(query).select(["-password", "-email"]);
};

/**
 * Fetch a specific doctor's availability and booked slots.
 * @param {string} docId - The ID of the doctor
 * @returns {Promise<Object>} Doctor's availability status and slots_booked
 */
export const getDoctorAvailability = async (docId) => {
  const docData = await doctorModel.findById(docId).select("available slots_booked");
  if (!docData) {
    throw new Error("Doctor not found");
  }
  return {
    available: docData.available,
    slots_booked: docData.slots_booked || {},
  };
};
