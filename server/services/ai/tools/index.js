import { getDoctorsTool, getDoctorAvailabilityTool } from "./doctorTools.js";
import { bookAppointmentTool, getMyAppointmentsTool, cancelAppointmentTool } from "./appointmentTools.js";

export const tools = [
  getDoctorsTool,
  getDoctorAvailabilityTool,
  bookAppointmentTool,
  getMyAppointmentsTool,
  cancelAppointmentTool,
];
