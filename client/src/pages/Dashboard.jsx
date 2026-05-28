import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import TeamSidebar from '../components/TeamSidebar'
import TaskBoard from '../components/TaskBoard'
import TaskModal from '../components/TaskModal'

export default function Dashboard () {
  const { user, logout } = useAuth()
  const [teams, setTeams] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const loadTeams = async () => {
    const res = await api.get('/teams')
    setTeams(res.data)
    if (!selectedTeam && res.data.length) setSelectedTeam(res.data[0])
  }

  const loadTasks = async () => {
    const params = {}
    if (selectedTeam) params.teamId = selectedTeam.id
    if (assigneeFilter) params.assignee = assigneeFilter
    const res = await api.get('/tasks', { params })
    setTasks(res.data)
  }

  useEffect(() => {
    loadTeams()
  }, [])
  useEffect(() => {
    if (selectedTeam) loadTasks()
  }, [selectedTeam, assigneeFilter])

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  const openCreateTask = () => {
    setEditingTask(null)
    setShowTaskModal(true)
  }

  const openEditTask = task => {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleTaskSaved = () => {
    setShowTaskModal(false)
    loadTasks()
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      <nav className='bg-white shadow px-6 py-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold text-gray-800'>Team Task Manager</h1>
        <div className='flex items-center gap-4'>
          <span className='text-sm text-gray-600'>{user.email}</span>
          <button
            onClick={logout}
            className='text-sm text-red-600 hover:underline'
          >
            Logout
          </button>
        </div>
      </nav>

      <div className='flex flex-col md:flex-row max-w-7xl mx-auto p-4 gap-4'>
        <TeamSidebar
          teams={teams}
          selectedTeam={selectedTeam}
          onSelect={setSelectedTeam}
          onTeamsChanged={loadTeams}
          currentUserId={user.id}
        />

        <main className='flex-1 bg-white rounded-lg shadow p-6'>
          <div className='flex flex-wrap gap-3 items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold'>
              {selectedTeam ? selectedTeam.name : 'Select a team'}
            </h2>
            {selectedTeam && (
              <button
                onClick={openCreateTask}
                className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
              >
                + New Task
              </button>
            )}
          </div>

          {selectedTeam && (
            <div className='flex flex-wrap gap-3 mb-4'>
              <input
                type='text'
                placeholder='Search tasks...'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='flex-1 min-w-[200px] px-3 py-2 border rounded'
              />
              <select
                value={assigneeFilter}
                onChange={e => setAssigneeFilter(e.target.value)}
                className='px-3 py-2 border rounded'
              >
                <option value=''>All assignees</option>
                {selectedTeam.members?.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.id === user.id ? "Me" : m.displayName || m.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <TaskBoard
            tasks={filteredTasks}
            onEdit={openEditTask}
            onChanged={loadTasks}
          />
        </main>
      </div>

      {showTaskModal && (
        <TaskModal
          team={selectedTeam}
          task={editingTask}
          onClose={() => setShowTaskModal(false)}
          onSaved={handleTaskSaved}
        />
      )}
    </div>
  )
}
