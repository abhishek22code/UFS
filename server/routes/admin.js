const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// @route POST /api/admin/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.json({ token });
  }
  return res.status(401).json({ message: "Invalid credentials" });
});

module.exports = router;
