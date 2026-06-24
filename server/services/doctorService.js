import doctorModel from "../models/doctorModel.js";
import { getBookedSlotsForDoctor } from "./bookingService.js";

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
  const doctors = await doctorModel.find(query).select(["-password", "-email"]);

  const doctorsWithSlots = await Promise.all(
    doctors.map(async (doc) => {
      const docObj = doc.toObject();
      docObj.slots_booked = await getBookedSlotsForDoctor(doc._id.toString());
      return docObj;
    })
  );

  return doctorsWithSlots;
};

/**
 * Fetch a specific doctor's availability and booked slots.
 * @param {string} docId - The ID of the doctor
 * @returns {Promise<Object>} Doctor's availability status and slots_booked
 */
export const getDoctorAvailability = async (docId) => {
  const docData = await doctorModel.findById(docId).select("available");
  if (!docData) {
    throw new Error("Doctor not found");
  }
  return {
    available: docData.available,
    slots_booked: await getBookedSlotsForDoctor(docId),
  };
};
