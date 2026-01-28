import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function EmployeeTaskHistory() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    //  Protect route
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/employee/task-history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTasks(res.data);
      } catch (err) {
        console.error("Task history error:", err);
        alert("Failed to load task history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token, navigate]);

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={title}>Task History</h2>
        <p style={subtitle}>Completed tasks</p>

        {loading ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p>No completed tasks</p>
        ) : (
          tasks.map((task) => (
            <div key={task._id} style={taskCard}>
              <h4 style={{ marginBottom: "6px" }}>{task.title}</h4>

              <p style={{ color: "#aaa", fontSize: "14px" }}>
                Completed on:{" "}
                {new Date(task.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}

        <button
          style={btnSecondary}
          onClick={() => navigate("/employee")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// styles
const pageStyle = {
  minHeight: "100vh",
  background: "#111",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "serif",
};

const cardStyle = {
  width: "90%",
  maxWidth: "600px",
  background: "#1c1c1c",
  padding: "30px",
  borderRadius: "12px",
  color: "#fff",
  boxShadow: "0 0 25px rgba(0,0,0,0.6)",
};

const title = {
  textAlign: "center",
};

const subtitle = {
  textAlign: "center",
  color: "#aaa",
  marginBottom: "20px",
};

const taskCard = {
  background: "#222",
  border: "1px solid #444",
  borderRadius: "8px",
  padding: "15px",
  marginBottom: "12px",
};

const btnSecondary = {
  width: "100%",
  marginTop: "20px",
  background: "#333",
  color: "#fff",
  border: "1px solid #555",
  padding: "10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};