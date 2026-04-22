import { useState } from 'react'
import { Plus, Trash2, Clock, AlertTriangle, ArrowUp } from 'lucide-react'
import { api } from '../api'

const PRIORITY_STYLE = {
  high: { color: '#ff4d6d', bg: '#ff4d6d18', label: 'HIGH' },
  medium: { color: '#ffd166', bg: '#ffd16618', label: 'MED' },
  low: { color: '#00ffa3', bg: '#00ffa318', label: 'LOW' },
}

const STATUS_STYLE = {
  unassigned: { color: '#5a7a9a', label: '○ Unassigned' },
  assigned: { color: '#00e5ff', label: '● Assigned' },
  done: { color: '#00ffa3', label: '✓ Done' },
}

export default function TaskPanel({ tasks, projectId, onRefresh }) {
  const [form, setForm] = useState({
    title: '', description: '', required_skills: '',
    estimated_hours: 4, deadline: '', priority: 'medium'
  })
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  const handleAdd = async () => {
    if (!form.title || !form.description || !form.required_skills) return
    setLoading(true)
    await api.addTask(projectId, form)
    setForm({ title: '', description: '', required_skills: '', estimated_hours: 4, deadline: '', priority: 'medium' })
    setSkillInput('')
    onRefresh()
    setLoading(false)
  }

  const handleDelete = async (id) => {
    await api.deleteTask(projectId, id)
    onRefresh()
  }

  const addSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const skill = skillInput.trim().replace(',', '')
      if (!skill) return
      const current = form.required_skills ? form.required_skills.split(',').map(s => s.trim()).filter(Boolean) : []
      if (!current.includes(skill)) {
        setForm(f => ({ ...f, required_skills: [...current, skill].join(', ') }))
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skill) => {
    const updated = form.required_skills.split(',').map(s => s.trim()).filter(s => s !== skill).join(', ')
    setForm(f => ({ ...f, required_skills: updated }))
  }

  const skillTags = form.required_skills ? form.required_skills.split(',').map(s => s.trim()).filter(Boolean) : []

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <span style={styles.panelTitle}>TASKS</span>
        <span style={styles.count}>{tasks.length} tasks</span>
      </div>

      {/* Form */}
      <div style={styles.form}>
        <input placeholder="Task Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={styles.input} />
        <textarea placeholder="Task Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...styles.input, resize: 'vertical' }} />

        <div>
          <input placeholder="Required skills — press Enter to add" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} style={styles.input} />
          {skillTags.length > 0 && (
            <div style={styles.tagRow}>
              {skillTags.map(skill => (
                <span key={skill} style={styles.reqTag}>
                  {skill} <span onClick={() => removeSkill(skill)} style={{ cursor: 'pointer' }}>×</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={styles.row}>
          <input type="number" placeholder="Hours" value={form.estimated_hours} onChange={e => setForm(f => ({ ...f, estimated_hours: Number(e.target.value) }))} style={{ ...styles.input, width: '30%' }} />
          <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} style={{ ...styles.input, width: '40%' }} />
          <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={{ ...styles.input, width: '30%' }}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <button onClick={handleAdd} disabled={loading} style={styles.addBtn}>
          <Plus size={15} /> {loading ? 'Adding...' : 'Add Task'}
        </button>
      </div>

      {/* Task List */}
      <div style={styles.taskList}>
        {tasks.length === 0 && <div style={styles.empty}>No tasks yet. Add your first task above.</div>}
        {tasks.map((t, idx) => {
          const p = PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.medium
          const s = STATUS_STYLE[t.status] || STATUS_STYLE.unassigned
          const skills = t.required_skills.split(',').map(s => s.trim()).filter(Boolean)

          return (
            <div key={t.id} style={{ ...styles.taskCard, animationDelay: `${idx * 0.05}s` }} className="fade-up">
              <div style={styles.taskTop}>
                <div style={{ flex: 1 }}>
                  <div style={styles.taskTitle}>{t.title}</div>
                  <div style={styles.taskDesc}>{t.description.slice(0, 80)}{t.description.length > 80 ? '...' : ''}</div>
                </div>
                <div style={styles.rightMeta}>
                  <span style={{ ...styles.priorityBadge, color: p.color, background: p.bg }}>{p.label}</span>
                  <button onClick={() => handleDelete(t.id)} style={styles.deleteBtn}><Trash2 size={13} /></button>
                </div>
              </div>

              <div style={styles.taskMeta}>
                <span style={styles.metaItem}><Clock size={11} /> {t.estimated_hours}h</span>
                {t.deadline && <span style={styles.metaItem}><AlertTriangle size={11} /> {t.deadline}</span>}
                <span style={{ ...styles.statusDot, color: s.color }}>{s.label}</span>
              </div>

              <div style={styles.tagRow}>
                {skills.map(skill => <span key={skill} style={styles.skillTag}>{skill}</span>)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  panel: { display: 'flex', flexDirection: 'column', gap: 16, height: '100%' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#7c3aed', fontFamily: 'JetBrains Mono, monospace' },
  count: { fontSize: 12, color: '#5a7a9a', fontFamily: 'JetBrains Mono, monospace' },
  form: { display: 'flex', flexDirection: 'column', gap: 10, background: '#0e1420', borderRadius: 12, padding: 16, border: '1px solid #1e2d45' },
  input: { background: '#151d2e', border: '1px solid #1e2d45', color: '#e2eaf4', borderRadius: 8, padding: '10px 14px', width: '100%', fontSize: 13, fontFamily: 'Syne, sans-serif', outline: 'none' },
  row: { display: 'flex', gap: 8 },
  addBtn: { display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', background: '#7c3aed', color: '#fff', borderRadius: 8, padding: '10px 16px', fontWeight: 700, fontSize: 13, fontFamily: 'Syne, sans-serif', cursor: 'pointer' },
  taskList: { display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1 },
  taskCard: { background: '#0e1420', border: '1px solid #1e2d45', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  taskTop: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  taskTitle: { fontWeight: 700, fontSize: 14 },
  taskDesc: { fontSize: 12, color: '#5a7a9a', marginTop: 3, lineHeight: 1.5 },
  rightMeta: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  priorityBadge: { fontSize: 9, fontWeight: 800, letterSpacing: 1.5, padding: '3px 8px', borderRadius: 99, fontFamily: 'JetBrains Mono, monospace' },
  deleteBtn: { background: 'transparent', border: 'none', color: '#5a7a9a', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' },
  taskMeta: { display: 'flex', alignItems: 'center', gap: 14 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5a7a9a', fontFamily: 'JetBrains Mono, monospace' },
  statusDot: { fontSize: 11, fontFamily: 'JetBrains Mono, monospace', marginLeft: 'auto' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  reqTag: { fontSize: 10, padding: '3px 8px', borderRadius: 99, border: '1px solid #7c3aed', color: '#7c3aed', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 },
  skillTag: { fontSize: 10, padding: '3px 8px', borderRadius: 99, border: '1px solid #1e2d45', color: '#5a7a9a', fontWeight: 600 },
  empty: { color: '#5a7a9a', fontSize: 13, textAlign: 'center', padding: '32px 0' },
}
