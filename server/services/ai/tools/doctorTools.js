import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getDoctorsList, getDoctorAvailability } from "../../doctorService.js";

export const getDoctorsTool = tool(
  async () => {
    try {
      const doctors = await getDoctorsList();
      return JSON.stringify(
        doctors.map((doc) => ({
          id: doc._id,
          name: doc.name,
          speciality: doc.speciality,
          experience: doc.experience,
          fees: doc.fees,
          available: doc.available,
        }))
      );
    } catch (error) {
      return `Failed to fetch doctors: ${error.message}`;
    }
  },
  {
    name: "get_doctors",
    description:
      "Get all doctors in the clinic. Returns id, name, speciality, experience, fees, and availability. Read each doctor's speciality to match what the user needs.",
    schema: z.object({}),
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
