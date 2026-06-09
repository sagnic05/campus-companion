import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

// The Smart Emoji Engine
const getIcon = (subject) => {
  const lowerSub = subject.toLowerCase()
  if (lowerSub.includes('dsa') || lowerSub.includes('data') || lowerSub.includes('code')) return '💻'
  if (lowerSub.includes('phys')) return '⚛️'
  if (lowerSub.includes('math') || lowerSub.includes('calc')) return '📐'
  if (lowerSub.includes('net') || lowerSub.includes('web')) return '🌐'
  if (lowerSub.includes('chem')) return '🧪'
  return '📘' // Default book icon
}

export default function Schedule() {
  const [classes, setClasses] = useState([])
  const [newClass, setNewClass] = useState({ subject: '', time: '', day: 'Monday' })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) fetchClasses()
    })
  }, [])

  async function fetchClasses() {
    const { data, error } = await supabase.from('schedules').select('*')
    if (!error) setClasses(data || [])
  }

  async function addClass(e) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    const classToSave = { ...newClass, user_id: user.id }

    const { data, error } = await supabase.from('schedules').insert([classToSave]).select()
    if (!error) {
      setClasses([...classes, data[0]]) 
      setNewClass({ subject: '', time: '', day: 'Monday' }) 
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
      <h2 style={{ marginTop: 0 }}>📅 My Class Schedule</h2>
      
      <form onSubmit={addClass} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input 
          type="text" placeholder="Subject (e.g. DSA)" required
          value={newClass.subject} onChange={(e) => setNewClass({...newClass, subject: e.target.value})}
          style={{ flex: 1, padding: '10px' }}
        />
        <input 
          type="text" placeholder="Time (e.g. 10:00 AM)" required
          value={newClass.time} onChange={(e) => setNewClass({...newClass, time: e.target.value})}
          style={{ padding: '10px', width: '150px' }}
        />
        <select value={newClass.day} onChange={(e) => setNewClass({...newClass, day: e.target.value})} style={{ padding: '10px' }}>
          <option>Monday</option><option>Tuesday</option><option>Wednesday</option>
          <option>Thursday</option><option>Friday</option>
        </select>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Add
        </button>
      </form>

      {classes.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255,255,255,0.4)',
          margin: '20px 0'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏕️</div>
          <h3 style={{ margin: '0 0 5px 0' }}>Your schedule is empty</h3>
          <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>
            Add your first lecture above to get started.
          </p>
        </div>
      ) : null}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {classes.map((cls) => (
          <div key={cls.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
            <strong style={{ fontSize: '18px' }}>
              {getIcon(cls.subject)} {cls.subject}
            </strong>
            <span style={{ opacity: 0.8 }}>{cls.day} at {cls.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}