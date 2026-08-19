import ContactMessage from "../models/ContactMessage.js";
import * as R from "../utils/apiResponse.js";

export const submitContact = async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return R.error(res, "Name, email, and message are required", 400);
  }
  const contact = await ContactMessage.create({ name, email, subject, message });
  R.created(res, { contact }, "Message received. Our team will respond within 4 business hours.");
};

export const getContactMessages = async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;
  const filter = {};
  if (isRead !== undefined) filter.isRead = isRead === "true";

  const skip = (Number(page) - 1) * Number(limit);
  const [messages, total] = await Promise.all([
    ContactMessage.find(filter).sort("-createdAt").skip(skip).limit(Number(limit)),
    ContactMessage.countDocuments(filter),
  ]);
  R.paginated(res, messages, total, page, limit);
};

export const markContactRead = async (req, res) => {
  const msg = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  if (!msg) return R.error(res, "Message not found", 404);
  R.success(res, { message: msg }, "Marked as read");
};
