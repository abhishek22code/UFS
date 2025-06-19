import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./FeedbackForm.module.css";

function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    rating: 5,
    product: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/feedback", formData);
      setSuccess("Have a Good Day");
      setShowModal(true);
      setFormData({ name: "", email: "", message: "", rating: 5, product: "" });
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.feedbackForm}>
      <h2>Submit Feedback</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="product"
          placeholder="Product Name"
          required
          value={formData.product}
          onChange={handleChange}
        />
        <textarea
          name="message"
          placeholder="Your Feedback"
          required
          value={formData.message}
          onChange={handleChange}
        />
        <label>Rating:</label>
        <div className={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={formData.rating >= n ? styles.selected : ""}
              onClick={() =>
                setFormData((prev) => ({ ...prev, rating: n }))
              }
            >
              ★
            </span>
          ))}
        </div>
        <button type="submit">Submit</button>
      </form>

      <button className={styles.homeButton} onClick={() => navigate("/")}>
        Go to Homepage
      </button>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalContent}>
              <h3>Thank You!</h3>
              <p>{success}</p>
              <button className={styles.modalCloseBtn} onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackForm;
