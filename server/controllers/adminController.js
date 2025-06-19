const jwt = require("jsonwebtoken");

const ADMIN = {
  username: "admin",
  password: "admin123", // In real app, use hashed passwords + DB
};

const loginAdmin = (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN.username && password === ADMIN.password) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ token });
  }

  return res.status(401).json({ message: "Invalid credentials" });
};

module.exports = { loginAdmin };
