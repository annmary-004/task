import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [approvedEmployees, setApprovedEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [taskTitle, setTaskTitle] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  /*  PROTECT ROUTE */
  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  /*  FETCH EMPLOYEES */
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/employees",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingEmployees(res.data.filter(e => !e.isApproved));
      setApprovedEmployees(res.data.filter(e => e.isApproved));
    } catch {
      alert("Failed to load employees");
    }
  };

  /*  FETCH TASKS */
  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/tasks",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(res.data);
    } catch {
      alert("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  /*  APPROVE EMPLOYEE */
  const approveEmployee = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEmployees();
    } catch {
      alert("Approval failed");
    }
  };

  /*  ASSIGN TASK */
  const assignTask = async () => {
    if (!taskTitle.trim() || !selectedEmployee) {
      alert("Enter task & select employee");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/admin/task",
        { title: taskTitle, assignedTo: selectedEmployee },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTaskTitle("");
      setSelectedEmployee("");
      fetchTasks();
    } catch {
      alert("Task assignment failed");
    }
  };

  /*  DELETE TASK */
  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/admin/task/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch {
      alert("Delete failed");
    }
  };

  /*  LOGOUT */
  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    fetchEmployees();
    fetchTasks();
  }, []);

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={title}>Admin Dashboard</h2>
        <p style={subtitle}>Manage employees and tasks</p>

        <div style={topButtons}>
          <button onClick={logout} style={btnSecondary}>Logout</button>
        </div>

        {/* PENDING EMPLOYEES */}
        <section>
          <h3 style={sectionTitle}>Pending Employees</h3>

          {loading ? (
            <p>Loading...</p>
          ) : pendingEmployees.length === 0 ? (
            <p>No pending approvals</p>
          ) : (
            pendingEmployees.map(emp => (
              <div key={emp._id} style={box}>
                <p><b>{emp.name}</b></p>
                <p style={{ color: "#aaa" }}>{emp.email}</p>
                <button
                  style={btnPrimary}
                  onClick={() => approveEmployee(emp._id)}
                >
                  Approve
                </button>
              </div>
            ))
          )}
        </section>

        {/* ASSIGN TASK */}
        <section>
          <h3 style={sectionTitle}>Assign Task</h3>

          <input
            style={input}
            placeholder="Task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />

          <select
            style={input}
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="">Select Employee</option>
            {approvedEmployees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>

          <button style={btnPrimary} onClick={assignTask}>
            Assign Task
          </button>
        </section>

        {/* TASK LIST */}
        <section>
          <h3 style={sectionTitle}>Assigned Tasks</h3>

          {tasks.length === 0 ? (
            <p>No tasks assigned</p>
          ) : (
            tasks.map(task => (
              <div key={task._id} style={box}>
                <p><b>{task.title}</b></p>
                <p>Employee: {task.assignedTo?.name}</p>
                <p>Status: {task.status}</p>

                <button
                  style={btnDanger}
                  onClick={() => deleteTask(task._id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}


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
  maxWidth: "700px",
  background: "#1c1c1c",
  padding: "30px",
  borderRadius: "12px",
  color: "#fff",
  boxShadow: "0 0 25px rgba(0,0,0,0.6)",
};

const title = { textAlign: "center" };
const subtitle = { textAlign: "center", color: "#aaa", marginBottom: "20px" };
const sectionTitle = { marginTop: "25px", marginBottom: "10px" };

const topButtons = { display: "flex", justifyContent: "flex-end" };

const box = {
  background: "#222",
  border: "1px solid #444",
  borderRadius: "8px",
  padding: "15px",
  marginBottom: "12px",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  background: "#111",
  border: "1px solid #444",
  borderRadius: "6px",
  color: "#fff",
};

const btnPrimary = {
  background: "#00c6ff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnSecondary = {
  background: "#333",
  color: "#fff",
  border: "1px solid #555",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer",
};

const btnDanger = {
  background: "#d32f2f",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: "8px",
};