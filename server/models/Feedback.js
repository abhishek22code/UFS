const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    message: { type: String, required: true },
    product: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
