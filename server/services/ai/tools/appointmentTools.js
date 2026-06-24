import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  createAppointment,
  getUserAppointments,
  cancelUserAppointment,
} from "../../bookingService.js";

export const bookAppointmentTool = tool(
  async ({ docId, slotDate, slotTime }, config) => {
    try {
      // Expect userId to be passed via RunnableConfig
      const userId = config.configurable?.userId;
      if (!userId) {
        return "Failed: User ID not found in context. The user must be logged in.";
      }

      const appointment = await createAppointment(userId, docId, slotDate, slotTime);
      return `Appointment booked successfully! Appointment ID: ${appointment._id}`;
    } catch (error) {
      return `Failed to book appointment: ${error.message}`;
    }
  },
  {
    name: "book_appointment",
    description: "Book an appointment for the current user with a specific doctor. Date format should be DD_MM_YYYY. Time format should be e.g. '10:00 AM'.",
    schema: z.object({
      docId: z.string().describe("The ID of the doctor."),
      slotDate: z.string().describe("The date of the appointment in DD_MM_YYYY format (e.g., '24_06_2026')."),
      slotTime: z.string().describe("The time of the appointment (e.g., '10:00 AM', '11:30 AM')."),
    }),
  }
);

export const getMyAppointmentsTool = tool(
  async (inputs, config) => {
    try {
      const userId = config.configurable?.userId;
      if (!userId) {
        return "Failed: User ID not found in context. The user must be logged in.";
      }

      const appointments = await getUserAppointments(userId);
      return JSON.stringify(
        appointments.map((app) => ({
          id: app._id,
          doctorName: app.docData?.name,
          speciality: app.docData?.speciality,
          date: app.slotDate,
          time: app.slotTime,
          amount: app.amount,
          cancelled: app.cancelled,
          isCompleted: app.isCompleted,
        }))
      );
    } catch (error) {
      return `Failed to fetch appointments: ${error.message}`;
    }
  },
  {
    name: "get_my_appointments",
    description: "Get a list of all upcoming and past appointments for the currently logged-in user.",
    schema: z.object({}), // No inputs required
  }
);

export const cancelAppointmentTool = tool(
  async ({ appointmentId }, config) => {
    try {
      const userId = config.configurable?.userId;
      if (!userId) {
        return "Failed: User ID not found in context. The user must be logged in.";
      }

      await cancelUserAppointment(userId, appointmentId);
      return `Appointment ${appointmentId} cancelled successfully.`;
    } catch (error) {
      return `Failed to cancel appointment: ${error.message}`;
    }
  },
  {
    name: "cancel_appointment",
    description: "Cancel an existing appointment. Requires the exact appointment ID.",
    schema: z.object({
      appointmentId: z.string().describe("The ID of the appointment to cancel."),
    }),
  }
);
