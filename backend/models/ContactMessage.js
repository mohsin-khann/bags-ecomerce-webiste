import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, default: "General Inquiry" },
    message: { type: String, required: true, trim: true },
    isRead:  { type: Boolean, default: false },
    reply:   { type: String },
  },
  { timestamps: true }
);

contactMessageSchema.index({ isRead: 1, createdAt: -1 });

export default mongoose.model("ContactMessage", contactMessageSchema);
