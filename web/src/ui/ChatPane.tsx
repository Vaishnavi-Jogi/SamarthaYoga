import React, { useRef, useState } from 'react';
import { api } from '../api';

export const ChatPane: React.FC<{ analysis: any | null }> = ({ analysis }) => {
  const [message, setMessage] = useState('How can I improve this pose?');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function send() {
    setLoading(true);
    try {
      if (file) {
        const form = new FormData();
        form.append('file', file);
        form.append('age', String(analysis?.profile?.age || 30));
        form.append('flexibility', analysis?.profile?.flexibility || 'medium');
        form.append('goal', analysis?.profile?.goal || 'alignment');
        const resp = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        const a = resp.data;
        const chat = await api.post('/chat', { asana_name: a.asana_name, user_prompt: 'Recognise the asana using joint positions and tell its name according to classical yogic texts. Provide alignment principles, common mistakes, and intended effects adapted from classical sources in an easy-to-understand way.' });
        setReply(chat.data.message);
        setFile(null);
        if (fileInput.current) fileInput.current.value = '';
      } else {
        const payload = analysis ? {
          asana_name: analysis.asana_name,
          user_prompt: message,
        } : { user_prompt: message };
        const resp = await api.post('/chat', payload);
        setReply(resp.data.message);
      }
    } catch (e: any) {
      setReply(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => fileInput.current?.click()} title="Upload pose photo" style={{ width: 36, height: 36, borderRadius: 8 }}>+</button>
        <input ref={fileInput} type="file" accept="image/jpeg" onChange={(e)=> setFile(e.target.files?.[0] || null)} style={{ display:'none' }} />
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} style={{ flex: 1 }} disabled={!!file} />
        <button onClick={send} disabled={loading}>{loading ? 'Thinking…' : 'Send'}</button>
      </div>
      {file && <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Image selected: {file.name}. Text disabled.</div>}
      {reply && (
        <div style={{ marginTop: 8, background: '#f6f8fa', padding: 12, whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'auto' }}>{reply}</div>
      )}
    </div>
  );
};
