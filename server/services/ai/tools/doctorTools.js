import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getDoctorsList, getDoctorAvailability } from "../../doctorService.js";

export const getDoctorsTool = tool(
  async ({ speciality }) => {
    try {
      const doctors = await getDoctorsList({ speciality });
      // We want to return a simplified version of doctors to the AI to save tokens
      return JSON.stringify(
        doctors.map((doc) => ({
          id: doc._id,
          name: doc.name,
          speciality: doc.speciality,
          experience: doc.experience,
          fees: doc.fees,
          available: doc.available,
          about: doc.about,
        }))
      );
    } catch (error) {
      return `Failed to fetch doctors: ${error.message}`;
    }
  },
  {
    name: "get_doctors",
    description: "Search for doctors by speciality or list all doctors if no speciality is provided. Returns basic details like ID, name, speciality, and fees.",
    schema: z.object({
      speciality: z.string().optional().describe("The medical speciality to filter by (e.g., 'Dermatologist', 'Cardiologist')."),
    }),
  }
);

export const getDoctorAvailabilityTool = tool(
  async ({ docId }) => {
    try {
      const availability = await getDoctorAvailability(docId);
      return JSON.stringify(availability);
    } catch (error) {
      return `Failed to fetch doctor availability: ${error.message}`;
    }
  },
  {
    name: "get_doctor_availability",
    description: "Check the overall availability of a specific doctor and get their booked slots for all dates. You must pass the doctor's exact ID.",
    schema: z.object({
      docId: z.string().describe("The ID of the doctor (e.g., '6677f98e1e791e3e7f...')."),
    }),
  }
);
