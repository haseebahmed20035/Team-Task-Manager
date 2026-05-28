import { useState, useEffect } from "react";
import api from "../api";

export default function TaskModal({ team, task, onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("todo");
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setAssigneeId(task.assigneeId || "");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      setStatus(task.status || "todo");
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      title,
      description,
      teamId: team.id,
      assigneeId: assigneeId || "",
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      status,
    };
    try {
      if (task) await api.put(`/tasks/${task.id}`, payload);
      else await api.post("/tasks", payload);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{task ? "Edit Task" : "New Task"}</h2>
        {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <label className="block text-sm font-medium mb-1">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required
          className="w-full px-3 py-2 border rounded mb-3" />

        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
          className="w-full px-3 py-2 border rounded mb-3" />

        <label className="block text-sm font-medium mb-1">Assignee</label>
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3">
          <option value="">Unassigned</option>
          {team.members?.map((uid) => (
            <option key={uid} value={uid}>{uid.slice(0, 12)}...</option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">Due date</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3" />

        <label className="block text-sm font-medium mb-1">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-4">
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {task ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}