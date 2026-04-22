import { useState } from 'react'
import { Zap, Eye, EyeOff } from 'lucide-react'
import { api } from '../api'

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login') // login | register
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = async () => {
    setError('')
    if (!form.username || !form.password) { setError('Fill in all fields.'); return }
    if (mode === 'register' && !form.email) { setError('Email is required.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      const res = mode === 'login'
        ? await api.login(form.username, form.password)
        : await api.register({ username: form.username, email: form.email, password: form.password })

      if (res.access_token) {
        localStorage.setItem('hr_token', res.access_token)
        localStorage.setItem('hr_user', res.username)
        onAuth(res.username)
      } else {
        setError(res.detail || 'Something went wrong.')
      }
    } catch (e) {
      setError('Cannot connect to server. Is the backend running?')
    }
    setLoading(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handle() }

  return (
    <div style={styles.page}>
      {/* Background grid */}
      <div style={styles.grid} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}><Zap size={20} style={{ color: '#00e5ff' }} /></div>
          <div style={styles.logoText}>HireRight</div>
        </div>
        <div style={styles.tagline}>AI-Powered Task Allocation Engine</div>

        {/* Tab toggle */}
        <div style={styles.tabs}>
          <button onClick={() => { setMode('login'); setError('') }} style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}>
            Sign In
          </button>
          <button onClick={() => { setMode('register'); setError('') }} style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }}>
            Create Account
          </button>
        </div>

        {/* Form */}
        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              placeholder="e.g. arjun_mehta"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              onKeyDown={handleKey}
              style={styles.input}
              autoComplete="username"
            />
          </div>

          {mode === 'register' && (
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                placeholder="you@example.com"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onKeyDown={handleKey}
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                placeholder="Min. 6 characters"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={handleKey}
                style={{ ...styles.input, paddingRight: 40 }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button onClick={() => setShowPass(s => !s)} style={styles.eyeBtn}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button onClick={handle} disabled={loading} style={styles.submitBtn}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <div style={styles.footer}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} style={styles.link}>
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#080b10', position: 'relative', overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0, opacity: 0.03,
    backgroundImage: 'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)',
    backgroundSize: '40px 40px',
  },
  card: {
    width: '100%', maxWidth: 420, background: '#0e1420', border: '1px solid #1e2d45',
    borderRadius: 20, padding: '40px 36px', display: 'flex', flexDirection: 'column',
    gap: 24, position: 'relative', zIndex: 1,
    boxShadow: '0 0 60px #00e5ff08',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' },
  logoIcon: { width: 42, height: 42, borderRadius: 12, background: '#00e5ff12', border: '1px solid #00e5ff33', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 24, fontWeight: 800, color: '#e2eaf4' },
  tagline: { textAlign: 'center', fontSize: 12, color: '#5a7a9a', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1, marginTop: -16 },
  tabs: { display: 'flex', background: '#080b10', borderRadius: 10, padding: 4, gap: 4 },
  tab: { flex: 1, padding: '9px', borderRadius: 8, background: 'transparent', border: 'none', color: '#5a7a9a', fontSize: 13, fontWeight: 600, fontFamily: 'Syne, sans-serif', cursor: 'pointer', transition: 'all 0.2s' },
  tabActive: { background: '#1e2d45', color: '#e2eaf4' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 11, fontWeight: 700, color: '#5a7a9a', letterSpacing: 1.5, fontFamily: 'JetBrains Mono, monospace' },
  input: { background: '#151d2e', border: '1px solid #1e2d45', color: '#e2eaf4', borderRadius: 10, padding: '12px 14px', width: '100%', fontSize: 14, fontFamily: 'Syne, sans-serif', outline: 'none', transition: 'border-color 0.2s' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5a7a9a', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  error: { background: '#ff4d6d18', border: '1px solid #ff4d6d44', borderRadius: 8, padding: '10px 14px', color: '#ff4d6d', fontSize: 13 },
  submitBtn: { background: 'linear-gradient(135deg, #00e5ff, #7c3aed)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontWeight: 800, fontSize: 14, fontFamily: 'Syne, sans-serif', cursor: 'pointer', marginTop: 4, boxShadow: '0 0 24px #00e5ff22' },
  footer: { textAlign: 'center', fontSize: 13, color: '#5a7a9a' },
  link: { color: '#00e5ff', cursor: 'pointer', fontWeight: 600 },
}
