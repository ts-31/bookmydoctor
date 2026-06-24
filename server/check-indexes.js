import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/mongodb.js";
import appointmentModel from "./models/appointmentModel.js";

const fixDb = async () => {
  await connectDB();
  
  try {
    console.log("Removing conflicting duplicate appointments to allow index creation...");
    
    // The logs showed a conflict for userId "6a3b8e69d1f3c6fc6ab91532" at "25_06_2026", "02:00 PM".
    // We will delete the newest one to resolve the conflict.
    const duplicates = await appointmentModel.find({ 
      userId: "6a3b8e69d1f3c6fc6ab91532", 
      slotDate: "25_06_2026", 
      slotTime: "02:00 PM" 
    });

    if (duplicates.length > 1) {
      // Delete the second one
      await appointmentModel.findByIdAndDelete(duplicates[1]._id);
      console.log("Deleted duplicate appointment.");
    }

    // Force index creation and wait for it
    await appointmentModel.syncIndexes();
    console.log("Indexes synced successfully. Database is now protected.");
  } catch (error) {
    console.error("Error fixing DB:", error);
  }
  
  mongoose.connection.close();
};

fixDb();
