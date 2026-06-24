import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/mongodb.js";
import { createAppointment } from "./services/bookingService.js";
import doctorModel from "./models/doctorModel.js";
import userModel from "./models/userModel.js";

const testDoubleBook = async () => {
  await connectDB();
  
  // Find any doctor and user
  const doctor = await doctorModel.findOne();
  const user = await userModel.findOne();

  const slotDate = "01_01_2030";
  const slotTime = "10:00 AM";

  console.log("Booking first time...");
  try {
    await createAppointment(user._id.toString(), doctor._id.toString(), slotDate, slotTime);
    console.log("First booking successful!");
  } catch (e) {
    console.log("First booking failed:", e.message);
  }

  console.log("Booking second time...");
  try {
    await createAppointment(user._id.toString(), doctor._id.toString(), slotDate, slotTime);
    console.log("Second booking successful! (THIS IS A BUG)");
  } catch (e) {
    console.log("Second booking failed as expected:", e.message);
  }

  mongoose.connection.close();
};

testDoubleBook();
