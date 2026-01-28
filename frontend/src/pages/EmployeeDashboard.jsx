import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  /*  PROTECT ROUTE */
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  /*  FETCH TASKS */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/employee/tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTasks(res.data);
    } catch {
      alert("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  /* UPDATE STATUS */
  const updateStatus = async (taskId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/employee/task/${taskId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTasks();
    } catch {
      alert("Failed to update status");
    }
  };

  /*  LOGOUT */
  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Employee Dashboard</h2>
        <p style={subtitleStyle}>View and update your assigned tasks</p>

        {/* ACTION BUTTONS */}
        <div style={buttonRow}>
          <button onClick={logout} style={btnSecondary}>
            Logout
          </button>
          <button
            onClick={() => navigate("/employee/history")}
            style={btnPrimary}
          >
            Task History
          </button>
        </div>

        {/* TASK LIST */}
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : tasks.length === 0 ? (
          <p style={{ textAlign: "center" }}>No tasks assigned</p>
        ) : (
          tasks.map((task) => (
            <div key={task._id} style={taskCard}>
              <h4>{task.title}</h4>

              <p>
                <b>Status:</b>{" "}
                <span
                  style={{
                    color:
                      task.status === "Completed"
                        ? "#4caf50"
                        : task.status === "In Progress"
                        ? "#ff9800"
                        : "#aaa",
                  }}
                >
                  {task.status}
                </span>
              </p>

              <select
                value={task.status}
                onChange={(e) =>
                  updateStatus(task._id, e.target.value)
                }
                style={selectStyle}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// styles

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#111",
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

const titleStyle = {
  textAlign: "center",
  marginBottom: "5px",
};

const subtitleStyle = {
  textAlign: "center",
  color: "#aaa",
  marginBottom: "20px",
};

const buttonRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "20px",
};

const btnPrimary = {
  padding: "10px 15px",
  background: "#00c6ff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnSecondary = {
  padding: "10px 15px",
  background: "#333",
  color: "#fff",
  border: "1px solid #555",
  borderRadius: "6px",
  cursor: "pointer",
};

const taskCard = {
  border: "1px solid #444",
  borderRadius: "8px",
  padding: "15px",
  marginBottom: "15px",
  background: "#222",
};

const selectStyle = {
  width: "100%",
  padding: "8px",
  marginTop: "8px",
  background: "#111",
  color: "#fff",
  border: "1px solid #444",
  borderRadius: "5px",
};