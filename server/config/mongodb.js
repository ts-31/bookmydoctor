import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }
  mongoose.connection.on("connected", () => console.log("Database Connected!"));
  await mongoose.connect(`${process.env.MONGODB_URI}/prescripto`);
  isConnected = true;
};

export default connectDB;
