import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/mongodb.js";
import doctorModel from "./models/doctorModel.js";

const clearDoctorSlots = async () => {
  await connectDB();
  
  try {
    console.log("Clearing all slots_booked data from doctors...");
    
    // Reset slots_booked to an empty object for all doctors
    await doctorModel.updateMany({}, { $set: { slots_booked: {} } });
    
    console.log("All doctors' schedules are now completely free!");
  } catch (error) {
    console.error("Error clearing slots:", error);
  }
  
  mongoose.connection.close();
};

clearDoctorSlots();
