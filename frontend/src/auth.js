// Simple mock auth module
export function login(token, user) {
  if (token && user) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    listeners.forEach(fn => fn(true))
    return true
  }
  return false
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  listeners.forEach(fn => fn(false))
}

export function isAuthenticated() {
  return !!localStorage.getItem('token')
}

let listeners = []
export function subscribe(fn) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter(l => l !== fn)
  }
}
