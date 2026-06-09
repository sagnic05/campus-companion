import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Schedule from './Schedule'
import Notes from './Notes'
import Auth from './Auth'

export default function App() {
  const [session, setSession] = useState(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    supabase.auth.onAuthStateChange((_event, session) => setSession(session))
  }, [])

  // Toggle Dark Mode function
  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light'
    setIsDark(!isDark)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  if (!session) return <Auth />

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header with Glass Effect */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Campus Companion</h1>
          <h2 style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Hooghly Engineering and Technology College</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={toggleTheme}
            style={{ padding: '8px 15px', backgroundColor: isDark ? '#f6ad55' : '#4a5568', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
          
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{ padding: '8px 15px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </div>
      
      <Schedule /> 
      <Notes />
      
    </div>
  )
}