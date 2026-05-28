import { useState } from "react";
import api from "../api";

export default function TeamSidebar({ teams, selectedTeam, onSelect, onTeamsChanged, currentUserId }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const createTeam = async (e) => {
    e.preventDefault();
    await api.post("/teams", { name, description });
    setName(""); setDescription(""); setShowForm(false);
    onTeamsChanged();
  };

  const deleteTeam = async (id) => {
    if (!confirm("Delete this team?")) return;
    try {
      await api.delete(`/teams/${id}`);
      onTeamsChanged();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail || !selectedTeam) return;
    try {
      await api.post(`/teams/${selectedTeam.id}/members`, { email: inviteEmail });
      alert("Member added (and invite stubbed in server logs)");
      setInviteEmail("");
      onTeamsChanged();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  return (
    <aside className="w-full md:w-64 bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold">Teams</h2>
        <button onClick={() => setShowForm(!showForm)} className="text-blue-600 text-sm hover:underline">
          {showForm ? "Cancel" : "+ New"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createTeam} className="mb-3 space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team name"
            className="w-full px-2 py-1 border rounded text-sm"
            required
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full px-2 py-1 border rounded text-sm"
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700">
            Create
          </button>
        </form>
      )}

      <ul className="space-y-1">
        {teams.map((t) => (
          <li
            key={t.id}
            className={`px-3 py-2 rounded cursor-pointer flex justify-between items-center ${
              selectedTeam?.id === t.id ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`}
            onClick={() => onSelect(t)}
          >
            <span className="text-sm truncate">{t.name}</span>
            {t.createdBy === currentUserId && (
              <button
                onClick={(e) => { e.stopPropagation(); deleteTeam(t.id); }}
                className="text-red-500 text-xs hover:underline"
              >
                ✕
              </button>
            )}
          </li>
        ))}
        {teams.length === 0 && <li className="text-sm text-gray-500">No teams yet</li>}
      </ul>

      {selectedTeam && (
        <div className="mt-4 pt-4 border-t">
          <h3 className="text-sm font-semibold mb-2">Invite member</h3>
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="user@email.com"
            className="w-full px-2 py-1 border rounded text-sm mb-2"
          />
          <button onClick={inviteMember} className="w-full bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700">
            Add
          </button>
          <p className="text-xs text-gray-500 mt-2">
            {selectedTeam.members?.length || 0} member(s)
          </p>
        </div>
      )}
    </aside>
  );
}