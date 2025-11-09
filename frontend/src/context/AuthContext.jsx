import React, {createContext, useContext, useState, useEffect} from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({children}){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    // load current user from server (cookie-based auth)
    api.get('/auth/me').then(res=>{
      setUser(res.data.user)
    }).catch(()=>{
      setUser(null)
    }).finally(()=> setLoading(false))
  },[])

  const login = async (username, password) => {
    // API sets HttpOnly cookie and returns basic user info
    const res = await api.post('/auth/login', { username, password })
    // fetch /me for canonical user data from database
    const me = await api.get('/auth/me')
    const userData = me.data.user
    setUser(userData)
    
    // persist role and username for UI convenience
    if (userData?.role) localStorage.setItem('role', userData.role)
    if (userData?.username) localStorage.setItem('username', userData.username)
    
    return userData
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch(e){}
    setUser(null)
    localStorage.removeItem('role')
    localStorage.removeItem('username')
  }

  return <AuthContext.Provider value={{user, setUser, loading, login, logout}}>{children}</AuthContext.Provider>
}

export function useAuth(){ return useContext(AuthContext) }
