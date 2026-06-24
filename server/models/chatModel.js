import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { _id: false });

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    unique: true,
    index: true,
  },
  messages: [messageSchema],
  lastActiveAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const chatModel = mongoose.models.chat || mongoose.model("chat", chatSchema);
export default chatModel;
