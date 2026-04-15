import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  text: {
    type: String,
    required: true,
    maxlength: 300,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  sender: {
    ip: String,

    country: String,
    region: String,
    city: String,

    device: String,
    browser: String,
    os: String,

    userAgent: String,
    language: String,
    timezone: String,
  },
});

export default mongoose.model("Message", MessageSchema);
