import api from "../api";

const statusColors = {
  todo: "bg-gray-200 text-gray-800",
  in_progress: "bg-yellow-200 text-yellow-800",
  done: "bg-green-200 text-green-800",
};

export default function TaskBoard({ tasks, onEdit, onChanged }) {
  const deleteTask = async (id) => {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    onChanged();
  };

  if (tasks.length === 0) {
    return <p className="text-gray-500 text-center py-8">No tasks yet</p>;
  }

  return (
    <div className="space-y-2">
      {tasks.map((t) => {
        const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done";
        return (
          <div key={t.id} className="border rounded p-3 hover:shadow flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium">{t.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${statusColors[t.status] || statusColors.todo}`}>
                  {t.status.replace("_", " ")}
                </span>
                {isOverdue && <span className="text-xs text-red-600 font-semibold">⚠ Overdue</span>}
              </div>
              {t.description && <p className="text-sm text-gray-600 mt-1">{t.description}</p>}
              {t.dueDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Due: {new Date(t.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(t)} className="text-blue-600 text-sm hover:underline">Edit</button>
              <button onClick={() => deleteTask(t.id)} className="text-red-600 text-sm hover:underline">Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}