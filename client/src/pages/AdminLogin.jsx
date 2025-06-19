import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./AdminLogin.module.css";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://ufs-backend.onrender.com/api/admin/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "admin");
      navigate("/admin/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className={styles.adminLogin}>
      <h2 className={styles.heading}>Admin Login</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          name="username"
          type="text"
          placeholder="Username"
          onChange={handleChange}
        />
        <input
          className={styles.input}
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <button className={styles.button} type="submit">
          Login
        </button>
      </form>

      {/* ✅ Go to Home Button */}
      <button
        className={styles.homeButton}
        onClick={() => navigate("/")}
      >
        Go to Homepage
      </button>
    </div>
  );
};

export default AdminLogin;
