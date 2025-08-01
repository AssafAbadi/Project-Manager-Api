import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const apiUrl = process.env.REACT_APP_API_URL;

// Type definitions for project and task entities
type Project = {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
};

type Task = {
  id: number;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
};

// SVG icon components for visual style
const LogoutIcon = () => (
  <svg height="18" width="18" fill="none" viewBox="0 0 24 24">
    <path d="M16 17l5-5-5-5" stroke="#007aff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M21 12H9" stroke="#007aff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 19a7 7 0 110-14" stroke="#007aff" strokeWidth="2"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
    <rect x="4" y="7" width="16" height="12" rx="3" stroke="#ef4444" strokeWidth="2"/>
    <path d="M10 11v4M14 11v4M5 7h14" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7" stroke="#ef4444" strokeWidth="2"/>
  </svg>
);
const AddIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="#0ea5e9" strokeWidth="2"/>
    <path d="M12 8v8M8 12h8" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const EditIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
    <path d="M16.5 4.5l3 3L7 20.5H4v-3L16.5 4.5z" stroke="#6366f1" strokeWidth="2"/>
  </svg>
);


// Spinner component for loading state
const Spinner = () => (
  <div style={{ textAlign: "center", padding: 30 }}>
    <div style={{
      width: 34, height: 34, border: "4px solid #c6dafc", borderTop: "4px solid #007aff",
      borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto"
    }} />
    <style>
      {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
    </style>
  </div>
);

// Toast message for success/error feedback
const Toast: React.FC<{ message: string; type?: "error" | "success" }> = ({ message, type = "success" }) => (
  <div style={{
    position: "fixed",
    top: 18,
    right: 18,
    background: type === "success" ? "#e0f7fa" : "#fee2e2",
    color: type === "success" ? "#047857" : "#b91c1c",
    borderRadius: 10,
    padding: "12px 24px",
    boxShadow: "0 4px 18px #0002",
    fontWeight: 500,
    fontSize: 15,
    zIndex: 1200,
    transition: "all 0.4s",
    animation: "toast-pop 0.3s",
  }}>
    {message}
    <style>
      {`@keyframes toast-pop {0% {transform:translateY(-14px) scale(0.96); opacity:0.6} 100% {transform:translateY(0) scale(1); opacity:1}}`}
    </style>
  </div>
);

// Main Dashboard component
const Dashboard: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  // State for projects and loading
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [openProjectId, setOpenProjectId] = useState<number | null>(null);

  // State for tasks
  const [tasks, setTasks] = useState<Record<number, Task[]>>({});
  const [loadingTasks, setLoadingTasks] = useState<number | null>(null);

  // State for add/edit project
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [addingProject, setAddingProject] = useState(false);

  // State for add/edit task
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [loadingTaskProjectId, setLoadingTaskProjectId] = useState<number | null>(null);

  // State for editing task
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  // UI state: popup, filter, sort, error, toast
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [taskFilter, setTaskFilter] = useState<Record<number, "all" | "done" | "notdone">>({});
  const [taskSort, setTaskSort] = useState<Record<number, "date" | "title">>({});
  const [toast, setToast] = useState<{ msg: string, type: "error" | "success" } | null>(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

 

  // Effect: fetch projects on mount
  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, []);

  // Fetch projects from API
  async function fetchProjects() {
    setLoadingProjects(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${apiUrl}/api/projects`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Error loading projects.");
    }
    setLoadingProjects(false);
  }

  // Fetch tasks for a project
  async function loadTasks(projectId: number) {
    setLoadingTasks(projectId);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/tasks`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(prev => ({ ...prev, [projectId]: data }));
    } catch (err: any) {
      setError(err.message || "Error loading tasks.");
    } finally {
      setLoadingTasks(null);
    }
  }

  // Handle project open/close (accordion)
  function handleToggle(projectId: number) {
    if (openProjectId === projectId) {
      setOpenProjectId(null);
    } else {
      setOpenProjectId(projectId);
      if (!tasks[projectId]) {
        loadTasks(projectId);
      }
    }
    setEditingTaskId(null);
  }

  // Validation helpers
  function isProjectTitleValid() {
    return newProjectTitle.trim().length >= 3 && newProjectTitle.trim().length <= 100;
  }
  function isProjectDescriptionValid() {
    return newProjectDescription.length <= 500;
  }
  function isTaskTitleValid() {
    return newTaskTitle.trim().length > 0;
  }

  // Add new project
  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    setAddingProject(true);
    setError("");
    if (!isProjectTitleValid()) {
      setError("Project title must be 3–100 characters.");
      setAddingProject(false);
      return;
    }
    if (!isProjectDescriptionValid()) {
      setError("Description cannot exceed 500 characters.");
      setAddingProject(false);
      return;
    }
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${apiUrl}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          title: newProjectTitle,
          description: newProjectDescription.trim() ? newProjectDescription : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to add project");
      const data = await res.json();
      setProjects(prev => [...prev, data]);
      setNewProjectTitle("");
      setNewProjectDescription("");
      setToast({ msg: "Project created!", type: "success" });
    } catch (err: any) {
      setError(err.message || "Failed to add project");
      setToast({ msg: "Failed to add project", type: "error" });
    } finally {
      setAddingProject(false);
      setTimeout(() => setToast(null), 2000);
    }
  }

  // Popup confirmation for project deletion
  function handleDeleteProjectClick(projectId: number) {
    setProjectToDelete(projectId);
    setShowDeletePopup(true);
  }
  function handleDeleteCancel() {
    setShowDeletePopup(false);
    setProjectToDelete(null);
  }
  async function handleDeleteConfirm() {
    setShowDeletePopup(false);
    if (!projectToDelete) return;
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${apiUrl}/api/projects/${projectToDelete}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Failed to delete project");
      setProjects(prev => prev.filter(p => p.id !== projectToDelete));
      setOpenProjectId(null);
      setProjectToDelete(null);
      setToast({ msg: "Project deleted", type: "success" });
    } catch (err: any) {
      setError("Failed to delete project");
      setToast({ msg: "Failed to delete project", type: "error" });
    } finally {
      setTimeout(() => setToast(null), 1800);
    }
  }

  // Add task to a project
  async function handleAddTask(e: React.FormEvent, projectId: number) {
    e.preventDefault();
    setLoadingTaskProjectId(projectId);
    setError("");
    if (!isTaskTitleValid()) {
      setError("Task is invalid.");
      setLoadingTaskProjectId(null);
      return;
    }
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ title: newTaskTitle, dueDate: newTaskDueDate || null }),
      });
      if (!res.ok) throw new Error("Failed to add task");
      const data = await res.json();
      setTasks(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), data],
      }));
      setNewTaskTitle("");
      setNewTaskDueDate("");
      setToast({ msg: "Task added!", type: "success" });
    } catch (err: any) {
      setError(err.message || "Failed to add task");
      setToast({ msg: "Failed to add task", type: "error" });
    } finally {
      setLoadingTaskProjectId(null);
      setTimeout(() => setToast(null), 1800);
    }
  }

  // Edit a task
  function startEditTask(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
  }

  async function saveEditTask(projectId: number, task: Task) {
    setError("");
    if (editTitle.trim().length === 0) {
      setError("Task title is required.");
      return;
    }
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${apiUrl}/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          title: editTitle,
          isCompleted: task.isCompleted,
          dueDate: editDueDate || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      setTasks(prev => ({
        ...prev,
        [projectId]: prev[projectId].map(t =>
          t.id === task.id ? { ...t, title: editTitle, dueDate: editDueDate } : t
        ),
      }));
      setEditingTaskId(null);
      setToast({ msg: "Task updated!", type: "success" });
    } catch (err: any) {
      setError(err.message || "Failed to update task");
      setToast({ msg: "Failed to update task", type: "error" });
    } finally {
      setTimeout(() => setToast(null), 1800);
    }
  }

  // Toggle task completion
  async function toggleTaskCompletion(projectId: number, task: Task) {
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${apiUrl}/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          title: task.title,
          isCompleted: !task.isCompleted,
          dueDate: task.dueDate || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      setTasks(prev => ({
        ...prev,
        [projectId]: prev[projectId].map(t =>
          t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
        ),
      }));
      setToast({ msg: "Task updated", type: "success" });
    } catch (err: any) {
      setError(err.message || "Failed to update task");
      setToast({ msg: "Failed to update task", type: "error" });
    } finally {
      setTimeout(() => setToast(null), 1600);
    }
  }

  // Delete a task
  async function handleDeleteTask(projectId: number, taskId: number) {
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks(prev => ({
        ...prev,
        [projectId]: prev[projectId].filter(t => t.id !== taskId),
      }));
      setToast({ msg: "Task deleted", type: "success" });
    } catch (err: any) {
      setError(err.message || "Failed to delete task");
      setToast({ msg: "Failed to delete task", type: "error" });
    } finally {
      setTimeout(() => setToast(null), 1600);
    }
  }

  // Navigate to task details
  function goToTaskDetails(taskId: number) {
    navigate(`/tasks/${taskId}`);
  }

  // Logout logic
  function handleLogout() {
  if (onLogout) onLogout();
  navigate("/");
}


  // Get filtered and sorted tasks for a project
  function getFilteredAndSortedTasks(projectId: number): Task[] {
    let taskList = tasks[projectId] || [];
    const filter = taskFilter[projectId] || "all";
    if (filter === "done") {
      taskList = taskList.filter(t => t.isCompleted);
    } else if (filter === "notdone") {
      taskList = taskList.filter(t => !t.isCompleted);
    }
    const sort = taskSort[projectId] || "date";
    taskList = [...taskList].sort((a, b) => {
      if (sort === "date") {
        const dA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dA - dB;
      } else {
        return a.title.localeCompare(b.title);
      }
    });
    return taskList;
  }

  // Responsive design - set container width based on window size
  const containerWidth = window.innerWidth < 700 ? "98vw" : 650;

  // Main UI
  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)",
        fontFamily: "'Inter', Arial, sans-serif",
      }}
    >
      {/* Toast messages */}
      {toast && <Toast message={toast.msg} type={toast.type} />}

      {/* Header + Logout */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: containerWidth,
          margin: "0 auto",
          paddingTop: 24,
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: 1,
            color: "#0a2540",
            margin: 0,
          }}
        >
          Projects Dashboard
        </h2>
        <button
          style={{
            background: "#fff",
            border: "none",
            borderRadius: 99,
            boxShadow: "0 3px 16px 0 #b7d2f845",
            padding: "9px 18px",
            cursor: "pointer",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 7,
            color: "#007aff",
            fontSize: 16,
            transition: "background 0.14s, box-shadow 0.16s, transform 0.1s",
            marginLeft: 8,
          }}
          onClick={handleLogout}
          onMouseEnter={e => (e.currentTarget.style.background = "#f0f9ff")}
          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
          title="Logout"
        >
          <LogoutIcon />
          Logout
        </button>
      </div>

      <div
        style={{
          maxWidth: containerWidth,
          margin: "28px auto",
          borderRadius: 22,
          background: "rgba(255,255,255,0.96)",
          boxShadow: "0 8px 44px 0 rgba(50,50,90,0.12)",
          padding: window.innerWidth < 700 ? "24px 5px" : "32px 22px",
        }}
      >
        {/* Add Project Form */}
        <form
          onSubmit={handleAddProject}
          style={{
            display: "flex",
            flexDirection: window.innerWidth < 700 ? "column" : "row",
            alignItems: window.innerWidth < 700 ? "stretch" : "center",
            gap: 12,
            marginBottom: 30,
          }}
        >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <label style={{ fontWeight: 500, marginBottom: 4 }}>
                Project Title <span style={{ color: "red" }}>*</span>
            </label> 
          <input
            type="text"
            placeholder="Project Title (3–100 chars)"
            value={newProjectTitle}
            onChange={e => setNewProjectTitle(e.target.value)}
            required
            minLength={3}
            maxLength={100}
            style={{
              fontSize: 17,
              padding: "10px 14px",
              border: "1px solid #d1d5db",
              borderRadius: 13,
              outline: "none",
              background: "#f6faff",
              width: window.innerWidth < 700 ? "100%" : 240,
              flex: 1,
              marginBottom: window.innerWidth < 700 ? 8 : 0,
            }}
          />
          </div>
          <textarea
            placeholder="Description (optional, up to 500 chars)"
            value={newProjectDescription}
            onChange={e => setNewProjectDescription(e.target.value)}
            maxLength={500}
            style={{
              fontSize: 15,
              padding: "10px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: 13,
              outline: "none",
              background: "#f6faff",
              minHeight: 38,
              maxHeight: 90,
              width: window.innerWidth < 700 ? "100%" : 220,
              flex: 2,
              resize: "vertical",
              marginBottom: window.innerWidth < 700 ? 8 : 0,
            }}
          />
          <button
            type="submit"
            disabled={addingProject || !isProjectTitleValid()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "linear-gradient(95deg,#68c4fa 0%,#007aff 85%)",
              color: "#fff",
              border: "none",
              borderRadius: 99,
              fontWeight: 700,
              fontSize: 16,
              padding: "11px 20px",
              marginTop: window.innerWidth < 700 ? 8 : 0,
              cursor: addingProject ? "not-allowed" : "pointer",
              boxShadow: "0 4px 15px 0 rgba(0,122,255,0.09)",
              transition: "background 0.2s, box-shadow 0.15s, transform 0.12s",
              opacity: addingProject || !isProjectTitleValid() ? 0.5 : 1,
            }}
          >
            <AddIcon /> {addingProject ? "Adding..." : "Add Project"}
          </button>
        </form>

        {error && (
          <div
            style={{
              color: "#dc2626",
              background: "#fff0f0",
              borderRadius: 8,
              padding: "7px 12px",
              marginBottom: 10,
              fontSize: 15,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {loadingProjects && <Spinner />}
        {projects.length === 0 && !error && !loadingProjects && (
          <div style={{ textAlign: "center", color: "#bbb", margin: "28px 0 12px 0" }}>
            <div style={{ fontSize: 50, marginBottom: 10, opacity: 0.7 }}>📂</div>
            <div>No projects yet.<br />Create your first project above!</div>
          </div>
        )}

        {/* Projects List */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {projects.map((p, idx) => (
            <li
              key={p.id}
              style={{
                margin: "0 0 22px 0",
                padding: 0,
                background: openProjectId === p.id ? "#f4faff" : "#f9fbfd",
                borderRadius: 17,
                boxShadow: openProjectId === p.id
                  ? "0 6px 26px 0 rgba(0,112,244,0.10)"
                  : "0 2px 12px 0 rgba(0,0,0,0.07)",
                transition: "box-shadow 0.15s, background 0.16s",
                border: "1.2px solid #e3e7f5",
              }}
            >
              {/* Project header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "15px 18px",
                  borderRadius: 17,
                  minHeight: 28,
                  fontSize: 19,
                  fontWeight: 600,
                  color: "#264266",
                  background: openProjectId === p.id ? "#e3f2fd" : "transparent",
                  transition: "background 0.15s",
                  boxShadow: openProjectId === p.id ? "0 2px 12px #98e9ff22" : "none",
                  userSelect: "none",
                }}
                onClick={() => handleToggle(p.id)}
                tabIndex={0}
              >
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <span>{p.title}</span>
                  <span style={{ color: "#555", fontSize: 14, fontWeight: 400, marginTop: 1 }}>
                    {p.description}
                  </span>
                  <span style={{ color: "#b5b5c0", fontSize: 12, marginTop: 2 }}>
                    Created: {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    padding: 4,
                    marginLeft: 10,
                    borderRadius: 17,
                    cursor: "pointer",
                    transition: "background 0.13s",
                  }}
                  onClick={e => { e.stopPropagation(); handleDeleteProjectClick(p.id); }}
                  title="Delete project"
                  onMouseEnter={e => (e.currentTarget.style.background = "#ffe4e6")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <TrashIcon />
                </button>
              </div>

              {/* Accordion content: task list */}
              <div
                style={{
                  maxHeight: openProjectId === p.id ? 1000 : 0,
                  opacity: openProjectId === p.id ? 1 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.32s cubic-bezier(.7,.26,.4,1.06), opacity 0.17s",
                  background: "#f7fbff",
                  borderRadius: openProjectId === p.id ? "0 0 17px 17px" : "0 0 17px 17px",
                  padding: openProjectId === p.id ? "16px 12px 10px 24px" : "0 12px 0 24px",
                  boxShadow: openProjectId === p.id
                    ? "0 5px 18px 0 #bae7fa11"
                    : "none",
                }}
              >
                {openProjectId === p.id && (
                  <div>
                    {/* Filter/sort */}
                    <div
                      style={{
                        marginBottom: 9,
                        display: "flex",
                        gap: 24,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <label>
                        <span style={{ fontWeight: 500, fontSize: 14 }}>Filter:</span>
                        <select
                          style={{ marginLeft: 4, padding: "5px 10px", borderRadius: 7, border: "1px solid #ddd", fontSize: 15 }}
                          value={taskFilter[p.id] || "all"}
                          onChange={e => setTaskFilter(f => ({ ...f, [p.id]: e.target.value as any }))}
                        >
                          <option value="all">All</option>
                          <option value="done">Completed</option>
                          <option value="notdone">Not completed</option>
                        </select>
                      </label>
                      <label>
                        <span style={{ fontWeight: 500, fontSize: 14 }}>Sort:</span>
                        <select
                          style={{ marginLeft: 4, padding: "5px 10px", borderRadius: 7, border: "1px solid #ddd", fontSize: 15 }}
                          value={taskSort[p.id] || "date"}
                          onChange={e => setTaskSort(s => ({ ...s, [p.id]: e.target.value as any }))}
                        >
                          <option value="date">Due Date</option>
                          <option value="title">Title</option>
                        </select>
                      </label>
                    </div>
                    {/* Add task form */}
                    <form
                      onSubmit={e => handleAddTask(e, p.id)}
                      style={{
                        marginBottom: 10,
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 7,
                      }}
                    >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ fontWeight: 500, marginBottom: 4 }}>
                            Task Title <span style={{ color: "red" }}>*</span>
                        </label>
                      <input
                        type="text"
                        placeholder="Task title (required)"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        required
                        maxLength={100}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 10,
                          border: "1px solid #d1d5db",
                          fontSize: 15,
                          width: window.innerWidth < 700 ? 170 : 190,
                        }}
                      />
                      </div>

                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={e => setNewTaskDueDate(e.target.value)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 10,
                          border: "1px solid #e5e7eb",
                          fontSize: 15,
                          width: window.innerWidth < 700 ? 120 : 130,
                        }}
                      />
                      <button
                        type="submit"
                        disabled={loadingTaskProjectId === p.id || newTaskTitle.trim().length === 0}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          background: "linear-gradient(95deg,#5eead4 0%,#0ea5e9 88%)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 99,
                          fontWeight: 700,
                          fontSize: 15,
                          padding: "8px 18px",
                          cursor: loadingTaskProjectId === p.id ? "not-allowed" : "pointer",
                          boxShadow: "0 3px 9px 0 rgba(14,165,233,0.10)",
                          transition: "background 0.18s, box-shadow 0.15s, transform 0.12s",
                          opacity: loadingTaskProjectId === p.id || newTaskTitle.trim().length === 0 ? 0.5 : 1,
                        }}
                      >
                        <AddIcon /> {loadingTaskProjectId === p.id ? "Adding..." : "Add Task"}
                      </button>
                    </form>
                    {/* Tasks list */}
                    {loadingTasks === p.id ? (
                      <Spinner />
                    ) : (
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {getFilteredAndSortedTasks(p.id).length === 0 && (
                          <li style={{ color: "#bbb", fontSize: 15, margin: "12px 0" }}>
                            <span style={{ fontSize: 24 }}>📝</span> No tasks yet.
                          </li>
                        )}
                        {getFilteredAndSortedTasks(p.id).map(task => (
                          <li
                            key={task.id}
                            style={{
                              marginBottom: 8,
                              display: "flex",
                              alignItems: "center",
                              background: "#fff",
                              borderRadius: 10,
                              boxShadow: "0 2px 7px #e1e1fa22",
                              padding: "7px 12px",
                              minHeight: 36,
                              gap: 10,
                            }}
                          >
                            {/* Checkbox for task completion */}
                            <input
                              type="checkbox"
                              checked={task.isCompleted}
                              onChange={() => toggleTaskCompletion(p.id, task)}
                              style={{
                                marginRight: 6,
                                accentColor: "#22c55e",
                                width: 18,
                                height: 18,
                              }}
                            />
                            {/* Edit mode */}
                            {editingTaskId === task.id ? (
                              <>
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={e => setEditTitle(e.target.value)}
                                  style={{
                                    flex: 1,
                                    marginRight: 8,
                                    borderRadius: 7,
                                    padding: "3px 8px",
                                    fontSize: 15,
                                    border: "1px solid #ddd",
                                  }}
                                  maxLength={100}
                                />
                                <input
                                  type="date"
                                  value={editDueDate}
                                  onChange={e => setEditDueDate(e.target.value)}
                                  style={{
                                    marginRight: 8,
                                    borderRadius: 7,
                                    padding: "3px 8px",
                                    fontSize: 15,
                                    border: "1px solid #eee",
                                  }}
                                />
                                <button
                                    style={{
                                        marginRight: 4,
                                        border: "none",
                                        background: "#007aff",
                                        color: "#fff",
                                        borderRadius: 7,
                                        fontWeight: 600,
                                        padding: "4px 16px",
                                        fontSize: 15,
                                        cursor: "pointer",
                                    }}
                                    onClick={() => saveEditTask(p.id, task)}
                                    >
                                    Save
                                    </button>
                                <button
                                  style={{
                                    background: "#eee",
                                    color: "#222",
                                    borderRadius: 7,
                                    padding: "4px 10px",
                                    border: "none",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                  }}
                                  onClick={() => setEditingTaskId(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <span
                                  style={{
                                    textDecoration: task.isCompleted ? "line-through" : "none",
                                    flex: 1,
                                    cursor: "pointer",
                                    color: "#222",
                                    fontSize: 15,
                                    fontWeight: 500,
                                  }}
                                  onClick={() => goToTaskDetails(task.id)}
                                  title="Show task details"
                                >
                                  {task.title}
                                  {task.dueDate && (
                                    <span style={{ fontSize: 12, color: "#888", marginLeft: 9 }}>
                                      ({new Date(task.dueDate).toLocaleDateString()})
                                    </span>
                                  )}
                                </span>
                                <button
                                  style={{
                                    marginLeft: 6,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    borderRadius: 12,
                                    padding: 4,
                                    transition: "background 0.12s",
                                  }}
                                  title="Edit"
                                  onClick={() => startEditTask(task)}
                                  onMouseEnter={e => (e.currentTarget.style.background = "#eef2ff")}
                                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                >
                                  <EditIcon />
                                </button>
                              </>
                            )}
                            <button
                              style={{
                                marginLeft: 4,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: 12,
                                padding: 4,
                                transition: "background 0.12s",
                              }}
                              title="Delete task"
                              onClick={() => handleDeleteTask(p.id, task.id)}
                              onMouseEnter={e => (e.currentTarget.style.background = "#ffe4e6")}
                              onMouseLeave={e => (e.currentTarget.style.background = "none")}
                            >
                              <TrashIcon />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Popup for project deletion */}
      {showDeletePopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.19)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "white", padding: 36, borderRadius: 18, boxShadow: "0 3px 22px #0003", minWidth: 260 }}>
            <div style={{ marginBottom: 18, fontSize: 18, textAlign: "center", fontWeight: 600 }}>
              Are you sure you want to delete this project?
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
              <button style={{
                background: "#f44336",
                color: "white",
                padding: "8px 30px",
                borderRadius: 10,
                fontWeight: 700,
                border: "none",
                cursor: "pointer"
              }} onClick={handleDeleteConfirm}>Yes</button>
              <button style={{
                background: "#eee",
                color: "#222",
                padding: "8px 30px",
                borderRadius: 10,
                fontWeight: 500,
                border: "none",
                cursor: "pointer"
              }} onClick={handleDeleteCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
