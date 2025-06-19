import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import styles from "./AdminDashboard.module.css";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell
} from "recharts";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true,
});

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

const AdminDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgRating: 0 });
  const [view, setView] = useState("all");
  const [sortedFeedbacks, setSortedFeedbacks] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const navigate = useNavigate();

  const updateStatsAndCharts = (feedbackList) => {
    setSortedFeedbacks(feedbackList);

    const total = feedbackList.length;
    const totalRating = feedbackList.reduce((sum, f) => sum + f.rating, 0);
    const avgRating = total ? totalRating / total : 0;
    setStats({ total, avgRating });

    const statsMap = feedbackList.reduce((acc, fb) => {
      acc[fb.product] = acc[fb.product] || { count: 0, totalRating: 0 };
      acc[fb.product].count += 1;
      acc[fb.product].totalRating += fb.rating;
      return acc;
    }, {});

    setBarData(Object.entries(statsMap).map(([product, stats]) => ({
      name: product,
      feedbacks: stats.count,
    })));

    setPieData(Object.entries(statsMap).map(([product, stats]) => ({
      name: product,
      value: parseFloat((stats.totalRating / stats.count).toFixed(2)),
    })));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/feedback/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeedbacks(res.data.feedbacks);
        updateStatsAndCharts(res.data.feedbacks);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      }
    };

    fetchData();

    const token = localStorage.getItem("token");
    socket.emit("join_admin_room", token);

    // Listen for admin-specific feedback notification
    socket.on("admin_notification", (data) => {
      if (data?.type === "NEW_FEEDBACK_ADMIN" && data.payload) {
        const payload = {
          _id: data.payload.id,
          product: data.payload.product,
          rating: data.payload.rating,
          message: data.payload.message,
          name: "Anonymous",
          email: "N/A"
        };

        setFeedbacks((prev) => {
          const updated = [payload, ...prev];
          updateStatsAndCharts(updated);
          return updated;
        });
      }
    });

    return () => {
      socket.off("admin_notification");
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/admin/login");
  };

  const handleFilterByPopularity = () => {
    const productCount = {};
    feedbacks.forEach((fb) => {
      productCount[fb.product] = (productCount[fb.product] || 0) + 1;
    });
    const mostPopular = Object.entries(productCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    const filtered = feedbacks.filter((fb) => fb.product === mostPopular);
    setSortedFeedbacks(filtered);
  };

  const handleSortByAvgRating = () => {
    const grouped = {};
    feedbacks.forEach((fb) => {
      if (!grouped[fb.product]) grouped[fb.product] = [];
      grouped[fb.product].push(fb.rating);
    });
    const avgRatings = Object.entries(grouped).map(([product, ratings]) => ({
      product,
      avg: ratings.reduce((a, b) => a + b, 0) / ratings.length,
    }));
    const sortedProducts = avgRatings.sort((a, b) => b.avg - a.avg).map((p) => p.product);
    const sorted = [...feedbacks].sort(
      (a, b) => sortedProducts.indexOf(a.product) - sortedProducts.indexOf(b.product)
    );
    setSortedFeedbacks(sorted);
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </div>

      <div className={styles.viewToggle}>
        <button className={styles.btnToggle} onClick={() => setView("all")}>
          <span>List All Ratings</span>
        </button>
        <button className={styles.btnToggle} onClick={() => setView("charts")}>
          <span>View Charts</span>
        </button>
      </div>

      {view === "all" && (
        <>
          <div className={styles.stats}>
            <p>Total Feedbacks: {stats.total}</p>
            <p>Average Rating: {stats.avgRating.toFixed(1)} ⭐</p>
          </div>

          <div className={styles.filterActions}>
            <button className={styles.filterBtn} onClick={handleFilterByPopularity}>Filter by Popularity</button>
            <button className={styles.filterBtn} onClick={handleSortByAvgRating}>Sort by Avg Rating</button>
          </div>

          <div className={styles.feedbackList}>
            {sortedFeedbacks.map((fb) => (
              <div className={styles.feedbackItem} key={fb._id}>
                <p><strong>Product:</strong> {fb.product}</p>
                <p><strong>Name:</strong> {fb.name || "Anonymous"}</p>
                <p><strong>Email:</strong> {fb.email || "N/A"}</p>
                <p><strong>Message:</strong> {fb.message}</p>
                <p><strong>Rating:</strong> {fb.rating} ⭐</p>
              </div>
            ))}
          </div>
        </>
      )}

      {view === "charts" && (
        <div className={styles.chartsContainer}>
          <div className={styles.chartBox}>
            <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>
              Feedback Count by Product
            </h4>
            <BarChart width={300} height={250} data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="feedbacks" fill="#8884d8" />
            </BarChart>
          </div>

          <div className={styles.chartBox}>
            <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>
              Average Rating per Product
            </h4>
            <PieChart width={300} height={250}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
