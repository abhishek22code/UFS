import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Feedback System</h1>
      <div className={styles.buttonGroup}>
        <button
          className={styles.actionButton}
          onClick={() => navigate("/feedback")}
        >
          Submit Feedback
        </button>
        <button
          className={styles.actionButton}
          onClick={() => navigate("/admin/login")}
        >
          Admin Login
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
