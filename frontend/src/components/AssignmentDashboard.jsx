import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Brain, AlertCircle, CheckCircle2, Cpu } from 'lucide-react'

const CONF_COLOR = (score) => {
  if (score >= 75) return '#00ffa3'
  if (score >= 50) return '#ffd166'
  return '#ff4d6d'
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#0e1420', border: '1px solid #1e2d45', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
        <div style={{ color: '#00e5ff', fontWeight: 700 }}>{payload[0]?.payload?.name}</div>
        <div style={{ color: '#00ffa3' }}>Used: {payload[0]?.value}h</div>
        <div style={{ color: '#5a7a9a' }}>Free: {payload[0]?.payload?.free}h</div>
        <div style={{ color: '#ffd166' }}>{payload[0]?.payload?.utilization}% utilized</div>
      </div>
    )
  }
  return null
}

export default function AssignmentDashboard({ assignments, workload, summary, stats, loading }) {
  if (loading) {
    return (
      <div style={styles.loadingState}>
        <div style={styles.loadingIcon}><Cpu size={32} style={{ animation: 'pulse 1.5s infinite', color: '#00e5ff' }} /></div>
        <div style={styles.loadingText}>AI is analyzing skills and running semantic matching...</div>
        <div style={styles.loadingSubtext}>This may take 15–30 seconds on first run (model loading)</div>
      </div>
    )
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div style={styles.emptyState}>
        <Brain size={48} style={{ color: '#1e2d45', marginBottom: 16 }} />
        <div style={styles.emptyTitle}>No assignments yet</div>
        <div style={styles.emptySub}>Add team members and tasks, then click <strong style={{ color: '#00e5ff' }}>Auto-Assign</strong> to run the AI matcher.</div>
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>
      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{stats?.total || 0}</div>
          <div style={styles.statLabel}>TOTAL TASKS</div>
        </div>
        <div style={{ ...styles.statCard, borderColor: '#00ffa344' }}>
          <div style={{ ...styles.statNum, color: '#00ffa3' }}>{stats?.assigned || 0}</div>
          <div style={styles.statLabel}>ASSIGNED</div>
        </div>
        <div style={{ ...styles.statCard, borderColor: '#ff4d6d44' }}>
          <div style={{ ...styles.statNum, color: '#ff4d6d' }}>{stats?.unassigned || 0}</div>
          <div style={styles.statLabel}>UNASSIGNED</div>
        </div>
        <div style={{ ...styles.statCard, borderColor: '#ffd16644' }}>
          <div style={{ ...styles.statNum, color: '#ffd166' }}>
            {assignments.length > 0
              ? Math.round(assignments.filter(a => a.confidence_score).reduce((sum, a) => sum + a.confidence_score, 0) / assignments.filter(a => a.confidence_score).length)
              : 0}%
          </div>
          <div style={styles.statLabel}>AVG MATCH</div>
        </div>
      </div>

      {/* AI Summary */}
      {summary && (
        <div style={styles.summaryBox}>
          <div style={styles.summaryHeader}><Brain size={14} style={{ color: '#00e5ff' }} /> AI ALLOCATION SUMMARY</div>
          <div style={styles.summaryText}>{summary}</div>
        </div>
      )}

      {/* Assignment Table */}
      <div style={styles.tableWrap}>
        <div style={styles.tableHeader}>
          <span style={{ flex: 2 }}>TASK</span>
          <span style={{ flex: 1.5 }}>ASSIGNED TO</span>
          <span style={{ flex: 1, textAlign: 'center' }}>CONFIDENCE</span>
          <span style={{ flex: 3 }}>AI REASONING</span>
        </div>
        {assignments.map((a, i) => {
          const conf = a.confidence_score || 0
          const color = CONF_COLOR(conf)
          const assigned = a.member_name !== 'Unassigned'

          return (
            <div key={i} style={{ ...styles.tableRow, animationDelay: `${i * 0.06}s` }} className="fade-up">
              <span style={{ flex: 2, fontWeight: 600, fontSize: 13 }}>{a.task_title || a.task}</span>
              <span style={{ flex: 1.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                {assigned
                  ? <><div style={{ ...styles.dot, background: '#00ffa3' }} /><span style={{ color: '#e2eaf4', fontSize: 13 }}>{a.member_name}</span></>
                  : <><div style={{ ...styles.dot, background: '#ff4d6d' }} /><span style={{ color: '#ff4d6d', fontSize: 13 }}>Unassigned</span></>
                }
              </span>
              <span style={{ flex: 1, textAlign: 'center' }}>
                <span style={{ color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 13 }}>
                  {conf.toFixed(1)}%
                </span>
              </span>
              <span style={{ flex: 3, fontSize: 12, color: '#8aa0ba', lineHeight: 1.5 }}>
                {a.ai_reasoning || (assigned ? 'Matched by semantic skill similarity.' : 'No available team member with sufficient capacity.')}
              </span>
            </div>
          )
        })}
      </div>

      {/* Workload Chart */}
      {workload && workload.length > 0 && (
        <div style={styles.chartSection}>
          <div style={styles.sectionTitle}>TEAM WORKLOAD DISTRIBUTION</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={workload} barGap={4}>
              <XAxis dataKey="name" tick={{ fill: '#5a7a9a', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a7a9a', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="used" radius={[6, 6, 0, 0]} name="Hours Allocated">
                {workload.map((entry, i) => (
                  <Cell key={i} fill={entry.utilization > 80 ? '#ff4d6d' : entry.utilization > 50 ? '#ffd166' : '#00ffa3'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 20 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  statCard: { background: '#0e1420', border: '1px solid #1e2d45', borderRadius: 12, padding: '16px', textAlign: 'center' },
  statNum: { fontSize: 28, fontWeight: 800, color: '#e2eaf4', lineHeight: 1 },
  statLabel: { fontSize: 9, letterSpacing: 2, color: '#5a7a9a', fontFamily: 'JetBrains Mono, monospace', marginTop: 6 },
  summaryBox: { background: '#00e5ff08', border: '1px solid #00e5ff22', borderRadius: 12, padding: 16 },
  summaryHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#00e5ff', fontFamily: 'JetBrains Mono, monospace', marginBottom: 10 },
  summaryText: { fontSize: 13, color: '#8aa0ba', lineHeight: 1.7 },
  tableWrap: { display: 'flex', flexDirection: 'column', background: '#0e1420', borderRadius: 12, border: '1px solid #1e2d45', overflow: 'hidden' },
  tableHeader: { display: 'flex', gap: 16, padding: '10px 16px', background: '#080b10', fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#5a7a9a', fontFamily: 'JetBrains Mono, monospace', borderBottom: '1px solid #1e2d45' },
  tableRow: { display: 'flex', gap: 16, padding: '14px 16px', borderBottom: '1px solid #1e2d4555', alignItems: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 3 },
  chartSection: { background: '#0e1420', border: '1px solid #1e2d45', borderRadius: 12, padding: 20 },
  sectionTitle: { fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#5a7a9a', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16 },
  loadingIcon: { width: 64, height: 64, borderRadius: '50%', background: '#00e5ff10', border: '1px solid #00e5ff33', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 15, fontWeight: 600, color: '#e2eaf4', textAlign: 'center' },
  loadingSubtext: { fontSize: 12, color: '#5a7a9a', fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: '#2a3f5a' },
  emptySub: { fontSize: 13, color: '#5a7a9a', textAlign: 'center', maxWidth: 380, lineHeight: 1.6 },
}
