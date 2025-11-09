import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true, // send HttpOnly cookie
  headers: { 'Content-Type': 'application/json' }
})

// response interceptor to surface SQL messages or handle auth
api.interceptors.response.use(
  res => res,
  err => {
    // If backend returned SQL error messages, prefer them
    const data = err.response?.data
    const message = data?.error || data?.message || err.message
    return Promise.reject({ status: err.response?.status, message, original: err })
  }
)

export default api
