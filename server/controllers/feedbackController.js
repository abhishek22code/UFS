const Feedback = require("../models/Feedback");

// POST /api/feedback — Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { name, email, message, rating, product } = req.body;

    if (!message || !rating || !product) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    const feedback = new Feedback({ name, email, message, rating, product });
    await feedback.save();

    // Emit real-time update via Socket.IO
    const io = req.app.get("io");
    if (io) {
      // Emit raw feedback to all connected clients
      io.emit("new_feedback", feedback);

      // Emit trimmed admin notification to admin room only
      io.to("admin_room").emit("admin_notification", {
        type: "NEW_FEEDBACK_ADMIN",
        payload: {
          id: feedback._id,
          product: feedback.product,
          rating: feedback.rating,
          message: feedback.message.length > 50 
            ? feedback.message.substring(0, 50) + "..." 
            : feedback.message
        }
      });
    }

    res.status(201).json({
      message: "Feedback submitted successfully.",
      feedbackId: feedback._id,
    });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/feedback/all — Get all feedback (Admin only)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    const io = req.app.get("io");
    if (io && req.user?.role === "admin") {
      io.to("admin_room").emit("feedback_update", {
        type: "FEEDBACK_FETCHED",
        payload: {
          count: feedbacks.length,
          timestamp: new Date(),
        },
      });
    }

    res.status(200).json({ feedbacks });
  } catch (err) {
    console.error("Error retrieving feedback:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/feedback/stats — Optional: Aggregate stats
exports.getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const io = req.app.get("io");
    if (io) {
      io.emit("stats_update", {
        type: "STATS_UPDATED",
        payload: stats,
      });
    }

    res.status(200).json({ stats });
  } catch (err) {
    console.error("Error getting feedback stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};
