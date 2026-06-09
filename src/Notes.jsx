import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [file, setFile] = useState(null)
  const [subject, setSubject] = useState('')
  const [uploading, setUploading] = useState(false)

  // Fetch existing notes when the page loads
  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    const { data, error } = await supabase.from('notes').select('*')
    if (!error) setNotes(data || [])
  }

  // Handle the file upload process
  async function uploadNote(e) {
    e.preventDefault()
    if (!file || !subject) return alert('Please select a file and enter a subject')
    
    setUploading(true)

    // 1. Create a unique file name and upload it to the Storage Bucket
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}` 

    const { error: uploadError } = await supabase.storage
      .from('campus-notes')
      .upload(fileName, file)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      alert("Failed to upload physical file. Is your bucket named 'campus-notes'?")
      setUploading(false)
      return
    }

    // 2. Get the public URL so students can actually download it
    const { data: { publicUrl } } = supabase.storage
      .from('campus-notes')
      .getPublicUrl(fileName)

    // 3. Save the subject and URL to the Database Table
    const { data, error } = await supabase
      .from('notes')
      .insert([{ subject: subject, file_url: publicUrl }])
      .select()

    if (!error) {
      setNotes([...notes, data[0]]) // Add the new note to the screen
      setFile(null) // Reset form
      setSubject('')
      document.getElementById('file-upload').value = '' 
    }
    
    setUploading(false)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', borderTop: '2px dashed #ccc' }}>
      <h2>📚 Campus Notes Sharing</h2>
      
      {/* Upload Form */}
      <form onSubmit={uploadNote} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', backgroundColor: '#f0f4f8', borderRadius: '8px', marginBottom: '20px' }}>
        <input 
          type="text"
          placeholder="Subject (e.g. Physics Chapter 3)" 
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          style={{ padding: '8px' }}
        />
        <input 
          id="file-upload"
          type="file" 
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button 
          type="submit" 
          disabled={uploading}
          style={{ padding: '10px', backgroundColor: uploading ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {uploading ? 'Uploading to cloud...' : 'Upload Note'}
        </button>
      </form>

      {/* List of Uploaded Notes */}
      <div>
        {notes.length === 0 ? <p>No notes uploaded yet. Be the first!</p> : null}
        
        {notes.map((note) => (
          <div key={note.id} style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{note.subject}</strong>
            <a 
              href={note.file_url} 
              target="_blank" 
              rel="noreferrer" 
              style={{ backgroundColor: '#007bff', color: 'white', padding: '8px 12px', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}