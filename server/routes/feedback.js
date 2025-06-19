const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getAllFeedback
} = require("../controllers/feedbackController");
const authenticate = require("../middleware/auth");

// Public route to submit feedback
router.post("/", (req, res) => {
  submitFeedback(req, res, req.app.get('io')); // Pass the io instance
});

// Protected route to get all feedback (Admin)
router.get("/all", authenticate, (req, res) => {
  getAllFeedback(req, res, req.app.get('io')); // Pass the io instance
});

module.exports = router;