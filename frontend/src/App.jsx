import { useState, useEffect, useCallback } from 'react'
import { Zap, RotateCcw, Database, Users, ListTodo, LayoutDashboard, ArrowLeft } from 'lucide-react'
import AuthPage from './pages/AuthPage'
import ProjectsPage from './pages/ProjectsPage'
import TeamPanel from './components/TeamPanel'
import TaskPanel from './components/TaskPanel'
import AssignmentDashboard from './components/AssignmentDashboard'
import { api } from './api'

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('hr_user') || null)
  const [currentProject, setCurrentProject] = useState(null)
  const [view, setView] = useState('projects') // projects | project-detail

  // Project detail state
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [assignments, setAssignments] = useState([])
  const [workload, setWorkload] = useState([])
  const [summary, setSummary] = useState('')
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [assigning, setAssigning] = useState(false)
  const [notification, setNotification] = useState(null)

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3500)
  }

  const handleAuth = (username) => {
    setUser(username)
    setView('projects')
  }

  const handleLogout = () => {
    localStorage.removeItem('hr_token')
    localStorage.removeItem('hr_user')
    setUser(null)
    setCurrentProject(null)
    setView('projects')
  }

  const handleSelectProject = (project) => {
    setCurrentProject(project)
    setView('project-detail')
    setActiveTab('dashboard')
    setSummary('')
    setStats(null)
  }

  const handleBackToProjects = () => {
    setCurrentProject(null)
    setView('projects')
    setMembers([])
    setTasks([])
    setAssignments([])
    setWorkload([])
  }

  const refresh = useCallback(async () => {
    if (!currentProject) return
    const pid = currentProject.id
    const [m, t, a, w] = await Promise.all([
      api.getMembers(pid), api.getTasks(pid),
      api.getAssignments(pid), api.getWorkload(pid)
    ])
    setMembers(Array.isArray(m) ? m : [])
    setTasks(Array.isArray(t) ? t : [])
    setAssignments(Array.isArray(a) ? a : [])
    setWorkload(Array.isArray(w) ? w : [])
  }, [currentProject])

  useEffect(() => {
    if (view === 'project-detail' && currentProject) refresh()
  }, [view, currentProject, refresh])

  const handleAutoAssign = async () => {
    setAssigning(true)
    setActiveTab('dashboard')
    try {
      const result = await api.autoAssign(currentProject.id)
      if (result.detail) {
        notify(result.detail, 'error')
      } else {
        setSummary(result.summary)
        setStats({ total: result.total_tasks, assigned: result.assigned, unassigned: result.unassigned })
        await refresh()
        notify(`✓ ${result.assigned} tasks assigned successfully!`)
      }
    } catch (e) {
      notify('Error running assignment.', 'error')
    }
    setAssigning(false)
  }

  const handleSeedDemo = async () => {
    await api.seedDemo(currentProject.id)
    await refresh()
    notify('Demo data loaded! Click Auto-Assign.')
  }

  const handleReset = async () => {
    await api.reset(currentProject.id)
    setAssignments([])
    setStats(null)
    setSummary('')
    await refresh()
    notify('Assignments cleared.')
  }

  // ── Render: Not logged in ──────────────────────────────────────
  if (!user) return <AuthPage onAuth={handleAuth} />

  // ── Render: Projects list ──────────────────────────────────────
  if (view === 'projects') {
    return <ProjectsPage username={user} onSelectProject={handleSelectProject} onLogout={handleLogout} />
  }

  // ── Render: Project detail ─────────────────────────────────────
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'team', label: `Team (${members.length})`, icon: Users },
    { id: 'tasks', label: `Tasks (${tasks.length})`, icon: ListTodo },
  ]

  return (
    <div style={styles.app}>
      {notification && (
        <div style={{ ...styles.notification, background: notification.type === 'error' ? '#ff4d6d18' : '#00ffa318', borderColor: notification.type === 'error' ? '#ff4d6d44' : '#00ffa344', color: notification.type === 'error' ? '#ff4d6d' : '#00ffa3' }}>
          {notification.msg}
        </div>
      )}

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={handleBackToProjects} style={styles.backBtn}>
            <ArrowLeft size={15} /> Projects
          </button>
          <div style={styles.divider} />
          <div style={styles.logo}>
            <div style={styles.logoIcon}><Zap size={16} style={{ color: '#00e5ff' }} /></div>
            <div>
              <div style={styles.logoText}>HireRight</div>
            </div>
          </div>
          <div style={styles.projectBadge}>{currentProject?.name}</div>
        </div>

        <div style={styles.headerActions}>
          <button onClick={handleSeedDemo} style={styles.seedBtn}>
            <Database size={13} /> Demo Data
          </button>
          <button onClick={handleReset} style={styles.resetBtn}>
            <RotateCcw size={13} /> Reset
          </button>
          <button onClick={handleAutoAssign} disabled={assigning} style={styles.assignBtn}>
            <Zap size={14} />
            {assigning ? 'Matching...' : 'Auto-Assign'}
          </button>
        </div>
      </header>

      <div style={styles.tabs}>
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}>
              <Icon size={13} /> {tab.label}
            </button>
          )
        })}
      </div>

      <main style={styles.main}>
        {activeTab === 'dashboard' && (
          <AssignmentDashboard assignments={assignments} workload={workload} summary={summary} stats={stats} loading={assigning} />
        )}
        {activeTab === 'team' && (
          <TeamPanel members={members} projectId={currentProject.id} onRefresh={refresh} />
        )}
        {activeTab === 'tasks' && (
          <TaskPanel tasks={tasks} projectId={currentProject.id} onRefresh={refresh} />
        )}
      </main>
    </div>
  )
}

const styles = {
  app: { minHeight: '100vh', background: '#080b10', display: 'flex', flexDirection: 'column' },
  notification: { position: 'fixed', top: 20, right: 20, padding: '12px 20px', borderRadius: 10, border: '1px solid', fontSize: 13, fontWeight: 600, zIndex: 999, fontFamily: 'JetBrains Mono, monospace', maxWidth: 360 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', borderBottom: '1px solid #1e2d45', background: '#080b10', position: 'sticky', top: 0, zIndex: 10 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid #1e2d45', color: '#5a7a9a', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600, fontFamily: 'Syne, sans-serif', cursor: 'pointer' },
  divider: { width: 1, height: 24, background: '#1e2d45' },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 32, height: 32, borderRadius: 8, background: '#00e5ff12', border: '1px solid #00e5ff33', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 16, fontWeight: 800, color: '#e2eaf4' },
  projectBadge: { background: '#7c3aed22', border: '1px solid #7c3aed44', color: '#a78bfa', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700 },
  headerActions: { display: 'flex', gap: 8, alignItems: 'center' },
  seedBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid #1e2d45', color: '#5a7a9a', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, fontFamily: 'Syne, sans-serif', cursor: 'pointer' },
  resetBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid #ff4d6d44', color: '#ff4d6d', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, fontFamily: 'Syne, sans-serif', cursor: 'pointer' },
  assignBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #00e5ff, #7c3aed)', color: '#fff', borderRadius: 8, padding: '9px 18px', fontWeight: 800, fontSize: 13, fontFamily: 'Syne, sans-serif', cursor: 'pointer', boxShadow: '0 0 20px #00e5ff22', border: 'none' },
  tabs: { display: 'flex', gap: 4, padding: '10px 28px', borderBottom: '1px solid #1e2d45' },
  tab: { display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 8, background: 'transparent', border: 'none', color: '#5a7a9a', fontSize: 13, fontWeight: 600, fontFamily: 'Syne, sans-serif', cursor: 'pointer' },
  tabActive: { background: '#1e2d45', color: '#e2eaf4' },
  main: { padding: '24px 28px', flex: 1, overflowY: 'auto' },
}
