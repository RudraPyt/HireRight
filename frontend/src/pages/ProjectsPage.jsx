import { useState, useEffect } from 'react'
import { Plus, Trash2, Zap, ChevronRight, Users, ListTodo, CheckCircle2, FolderOpen } from 'lucide-react'
import { api } from '../api'

export default function ProjectsPage({ username, onSelectProject, onLogout }) {
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const fetchProjects = async () => {
    setLoading(true)
    const data = await api.getProjects()
    setProjects(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchProjects() }, [])

  const handleCreate = async () => {
    if (!form.name.trim()) return
    setCreating(true)
    await api.createProject(form)
    setForm({ name: '', description: '' })
    setShowForm(false)
    await fetchProjects()
    setCreating(false)
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this project and all its data?')) return
    await api.deleteProject(id)
    fetchProjects()
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}><Zap size={17} style={{ color: '#00e5ff' }} /></div>
          <span style={styles.logoText}>HireRight</span>
        </div>
        <div style={styles.userRow}>
          <span style={styles.username}>👋 {username}</span>
          <button onClick={onLogout} style={styles.logoutBtn}>Sign Out</button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Page title */}
        <div style={styles.pageTop}>
          <div>
            <div style={styles.pageTitle}>Your Projects</div>
            <div style={styles.pageSub}>Each project has its own team, tasks, and AI allocations.</div>
          </div>
          <button onClick={() => setShowForm(s => !s)} style={styles.newBtn}>
            <Plus size={15} /> New Project
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div style={styles.createForm} className="fade-up">
            <input
              placeholder="Project name e.g. Product Launch Q3"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={styles.input}
              autoFocus
            />
            <input
              placeholder="Short description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={styles.input}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleCreate} disabled={creating} style={styles.createBtn}>
                {creating ? 'Creating...' : 'Create Project'}
              </button>
              <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* Projects grid */}
        {loading ? (
          <div style={styles.emptyState}>
            <div style={{ color: '#5a7a9a', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div style={styles.emptyState}>
            <FolderOpen size={52} style={{ color: '#1e2d45' }} />
            <div style={styles.emptyTitle}>No projects yet</div>
            <div style={styles.emptySub}>Create your first project to start allocating tasks with AI.</div>
            <button onClick={() => setShowForm(true)} style={styles.newBtn}><Plus size={14} /> Create First Project</button>
          </div>
        ) : (
          <div style={styles.grid}>
            {projects.map((p, i) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                style={{ ...styles.projectCard, animationDelay: `${i * 0.07}s` }}
                className="fade-up"
              >
                <div style={styles.cardTop}>
                  <div style={styles.projectIcon}>{p.name.charAt(0).toUpperCase()}</div>
                  <button onClick={(e) => handleDelete(e, p.id)} style={styles.deleteBtn}>
                    <Trash2 size={13} />
                  </button>
                </div>

                <div style={styles.projectName}>{p.name}</div>
                {p.description && <div style={styles.projectDesc}>{p.description}</div>}

                <div style={styles.projectStats}>
                  <span style={styles.stat}><Users size={11} /> {p.member_count} members</span>
                  <span style={styles.stat}><ListTodo size={11} /> {p.task_count} tasks</span>
                  <span style={{ ...styles.stat, color: '#00ffa3' }}><CheckCircle2 size={11} /> {p.assigned_count} assigned</span>
                </div>

                <div style={styles.cardFooter}>
                  <span style={styles.openText}>Open project</span>
                  <ChevronRight size={14} style={{ color: '#00e5ff' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#080b10', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 32px', borderBottom: '1px solid #1e2d45', background: '#080b10', position: 'sticky', top: 0, zIndex: 10 },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 34, height: 34, borderRadius: 8, background: '#00e5ff12', border: '1px solid #00e5ff33', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 18, fontWeight: 800, color: '#e2eaf4' },
  userRow: { display: 'flex', alignItems: 'center', gap: 14 },
  username: { fontSize: 13, color: '#5a7a9a', fontFamily: 'JetBrains Mono, monospace' },
  logoutBtn: { background: 'transparent', border: '1px solid #1e2d45', color: '#5a7a9a', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, fontFamily: 'Syne, sans-serif', cursor: 'pointer' },
  main: { padding: '36px 32px', flex: 1, maxWidth: 1100, margin: '0 auto', width: '100%' },
  pageTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  pageTitle: { fontSize: 28, fontWeight: 800, color: '#e2eaf4', marginBottom: 6 },
  pageSub: { fontSize: 13, color: '#5a7a9a' },
  newBtn: { display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #00e5ff, #7c3aed)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', fontWeight: 700, fontSize: 13, fontFamily: 'Syne, sans-serif', cursor: 'pointer', boxShadow: '0 0 20px #00e5ff18', whiteSpace: 'nowrap' },
  createForm: { background: '#0e1420', border: '1px solid #00e5ff33', borderRadius: 14, padding: 20, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 },
  input: { background: '#151d2e', border: '1px solid #1e2d45', color: '#e2eaf4', borderRadius: 8, padding: '11px 14px', fontSize: 14, fontFamily: 'Syne, sans-serif', outline: 'none', width: '100%' },
  createBtn: { background: '#00e5ff', color: '#080b10', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 13, fontFamily: 'Syne, sans-serif', cursor: 'pointer' },
  cancelBtn: { background: 'transparent', border: '1px solid #1e2d45', color: '#5a7a9a', borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 13, fontFamily: 'Syne, sans-serif', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  projectCard: { background: '#0e1420', border: '1px solid #1e2d45', borderRadius: 16, padding: 22, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12, transition: 'border-color 0.2s, transform 0.2s', position: 'relative' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  projectIcon: { width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #00e5ff18, #7c3aed28)', border: '1px solid #1e2d45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#00e5ff' },
  deleteBtn: { background: 'transparent', border: 'none', color: '#5a7a9a', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' },
  projectName: { fontSize: 16, fontWeight: 700, color: '#e2eaf4', lineHeight: 1.3 },
  projectDesc: { fontSize: 12, color: '#5a7a9a', lineHeight: 1.5 },
  projectStats: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  stat: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#5a7a9a', fontFamily: 'JetBrains Mono, monospace' },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 12, borderTop: '1px solid #1e2d4566' },
  openText: { fontSize: 12, color: '#00e5ff', fontWeight: 600 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 400 },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: '#2a3f5a' },
  emptySub: { fontSize: 13, color: '#5a7a9a', textAlign: 'center', maxWidth: 340, lineHeight: 1.6 },
}
