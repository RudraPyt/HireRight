import { useState } from 'react'
import { UserPlus, Trash2, Zap } from 'lucide-react'
import { api } from '../api'

const SKILL_COLORS = ['#00e5ff', '#7c3aed', '#00ffa3', '#ffd166', '#ff4d6d', '#f472b6', '#34d399']

export default function TeamPanel({ members, projectId, onRefresh }) {
  const [form, setForm] = useState({ name: '', skills: '', weekly_hours_available: 40 })
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  const handleAdd = async () => {
    if (!form.name || !form.skills) return
    setLoading(true)
    await api.addMember(projectId, form)
    setForm({ name: '', skills: '', weekly_hours_available: 40 })
    setSkillInput('')
    onRefresh()
    setLoading(false)
  }

  const handleDelete = async (id) => {
    await api.deleteMember(projectId, id)
    onRefresh()
  }

  const addSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const skill = skillInput.trim().replace(',', '')
      if (!skill) return
      const current = form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      if (!current.includes(skill)) {
        const updated = [...current, skill].join(', ')
        setForm(f => ({ ...f, skills: updated }))
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skill) => {
    const updated = form.skills.split(',').map(s => s.trim()).filter(s => s !== skill).join(', ')
    setForm(f => ({ ...f, skills: updated }))
  }

  const skillTags = form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : []

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <span style={styles.panelTitle}>TEAM MEMBERS</span>
        <span style={styles.count}>{members.length} people</span>
      </div>

      {/* Add Member Form */}
      <div style={styles.form}>
        <input
          placeholder="Full Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          style={styles.input}
        />

        <div>
          <input
            placeholder="Type a skill and press Enter..."
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={addSkill}
            style={styles.input}
          />
          {skillTags.length > 0 && (
            <div style={styles.tagRow}>
              {skillTags.map((skill, i) => (
                <span key={skill} style={{ ...styles.tag, borderColor: SKILL_COLORS[i % SKILL_COLORS.length], color: SKILL_COLORS[i % SKILL_COLORS.length] }}>
                  {skill}
                  <span onClick={() => removeSkill(skill)} style={styles.tagX}>×</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={styles.row}>
          <input
            type="number"
            placeholder="Weekly hours"
            value={form.weekly_hours_available}
            onChange={e => setForm(f => ({ ...f, weekly_hours_available: Number(e.target.value) }))}
            style={{ ...styles.input, width: '40%' }}
          />
          <button onClick={handleAdd} disabled={loading} style={styles.addBtn}>
            <UserPlus size={15} />
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>

      {/* Member Cards */}
      <div style={styles.memberList}>
        {members.length === 0 && (
          <div style={styles.empty}>No team members yet. Add your first one above.</div>
        )}
        {members.map((m, idx) => {
          const utilization = m.weekly_hours_available > 0
            ? Math.round((m.current_workload_hours / m.weekly_hours_available) * 100)
            : 0
          const barColor = utilization > 80 ? '#ff4d6d' : utilization > 50 ? '#ffd166' : '#00ffa3'
          const skills = m.skills.split(',').map(s => s.trim()).filter(Boolean)

          return (
            <div key={m.id} style={{ ...styles.memberCard, animationDelay: `${idx * 0.05}s` }} className="fade-up">
              <div style={styles.memberTop}>
                <div style={styles.avatar}>{m.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={styles.memberName}>{m.name}</div>
                  <div style={styles.memberHours}>
                    {m.current_workload_hours}h / {m.weekly_hours_available}h allocated
                  </div>
                </div>
                <button onClick={() => handleDelete(m.id)} style={styles.deleteBtn}>
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Workload bar */}
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${Math.min(utilization, 100)}%`, background: barColor }} />
              </div>
              <div style={{ ...styles.utilText, color: barColor }}>{utilization}% utilized</div>

              {/* Skill tags */}
              <div style={styles.tagRow}>
                {skills.slice(0, 4).map((skill, i) => (
                  <span key={skill} style={{ ...styles.tag, borderColor: SKILL_COLORS[i % SKILL_COLORS.length], color: SKILL_COLORS[i % SKILL_COLORS.length] }}>
                    {skill}
                  </span>
                ))}
                {skills.length > 4 && <span style={styles.moreTag}>+{skills.length - 4} more</span>}
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
  panelTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#00e5ff', fontFamily: 'JetBrains Mono, monospace' },
  count: { fontSize: 12, color: '#5a7a9a', fontFamily: 'JetBrains Mono, monospace' },
  form: { display: 'flex', flexDirection: 'column', gap: 10, background: '#0e1420', borderRadius: 12, padding: 16, border: '1px solid #1e2d45' },
  input: { background: '#151d2e', border: '1px solid #1e2d45', color: '#e2eaf4', borderRadius: 8, padding: '10px 14px', width: '100%', fontSize: 13, fontFamily: 'Syne, sans-serif', outline: 'none' },
  row: { display: 'flex', gap: 10, alignItems: 'center' },
  addBtn: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', background: '#00e5ff', color: '#080b10', borderRadius: 8, padding: '10px 16px', fontWeight: 700, fontSize: 13, fontFamily: 'Syne, sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' },
  memberList: { display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1 },
  memberCard: { background: '#0e1420', border: '1px solid #1e2d45', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  memberTop: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #00e5ff22, #7c3aed44)', border: '1px solid #1e2d45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#00e5ff', flexShrink: 0 },
  memberName: { fontWeight: 700, fontSize: 14, color: '#e2eaf4' },
  memberHours: { fontSize: 11, color: '#5a7a9a', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 },
  deleteBtn: { background: 'transparent', border: 'none', color: '#5a7a9a', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' },
  barTrack: { height: 4, background: '#1e2d45', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99, transition: 'width 0.5s ease' },
  utilText: { fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tag: { fontSize: 10, padding: '3px 8px', borderRadius: 99, border: '1px solid', fontWeight: 600, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 },
  tagX: { cursor: 'pointer', fontSize: 12, lineHeight: 1 },
  moreTag: { fontSize: 10, padding: '3px 8px', borderRadius: 99, border: '1px solid #1e2d45', color: '#5a7a9a', fontWeight: 600 },
  empty: { color: '#5a7a9a', fontSize: 13, textAlign: 'center', padding: '32px 0' },
}
