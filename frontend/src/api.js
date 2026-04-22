const BASE = 'https://hireright-backend.onrender.com'

const getToken = () => localStorage.getItem('hr_token')

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
})

const handle = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem('hr_token')
    localStorage.removeItem('hr_user')
    window.location.href = '/login'
    return
  }
  return res.json()
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────
  register: (data) => fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  login: (username, password) => {
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)
    return fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form
    }).then(r => r.json())
  },

  me: () => fetch(`${BASE}/auth/me`, { headers: authHeaders() }).then(r => handle(r)),

  // ── Projects ──────────────────────────────────────────────────
  getProjects: () => fetch(`${BASE}/projects`, { headers: authHeaders() }).then(r => handle(r)),

  createProject: (data) => fetch(`${BASE}/projects`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data)
  }).then(r => handle(r)),

  deleteProject: (id) => fetch(`${BASE}/projects/${id}`, {
    method: 'DELETE', headers: authHeaders()
  }).then(r => handle(r)),

  // ── Members ───────────────────────────────────────────────────
  getMembers: (pid) => fetch(`${BASE}/projects/${pid}/members`, { headers: authHeaders() }).then(r => handle(r)),

  addMember: (pid, data) => fetch(`${BASE}/projects/${pid}/members`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data)
  }).then(r => handle(r)),

  deleteMember: (pid, mid) => fetch(`${BASE}/projects/${pid}/members/${mid}`, {
    method: 'DELETE', headers: authHeaders()
  }).then(r => handle(r)),

  // ── Tasks ─────────────────────────────────────────────────────
  getTasks: (pid) => fetch(`${BASE}/projects/${pid}/tasks`, { headers: authHeaders() }).then(r => handle(r)),

  addTask: (pid, data) => fetch(`${BASE}/projects/${pid}/tasks`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data)
  }).then(r => handle(r)),

  deleteTask: (pid, tid) => fetch(`${BASE}/projects/${pid}/tasks/${tid}`, {
    method: 'DELETE', headers: authHeaders()
  }).then(r => handle(r)),

  // ── Assign ────────────────────────────────────────────────────
  autoAssign: (pid) => fetch(`${BASE}/projects/${pid}/assign`, {
    method: 'POST', headers: authHeaders()
  }).then(r => handle(r)),

  getAssignments: (pid) => fetch(`${BASE}/projects/${pid}/assignments`, { headers: authHeaders() }).then(r => handle(r)),

  getWorkload: (pid) => fetch(`${BASE}/projects/${pid}/workload`, { headers: authHeaders() }).then(r => handle(r)),

  seedDemo: (pid) => fetch(`${BASE}/projects/${pid}/seed-demo`, { headers: authHeaders() }).then(r => handle(r)),

  reset: (pid) => fetch(`${BASE}/projects/${pid}/reset`, {
    method: 'POST', headers: authHeaders()
  }).then(r => handle(r)),
}
