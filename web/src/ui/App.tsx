import React, { useEffect, useMemo, useState } from 'react';
import { UploadPane } from './UploadPane';
import { ChatPane } from './ChatPane';
import { api, setAuthToken } from '../api';

export const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [profile, setProfile] = useState<any | null>(null);
  const [interactiveIdx, setInteractiveIdx] = useState(0);

  const messages = useMemo(() => [
    'Breath in calm, Breath out stress',
    'Feel the streatch and find your power',
    'Steady breath, steady mind.',
    'Lengthen. Soften. Be present.',
  ], []);

  useEffect(() => {
    setInteractiveIdx(Math.floor(Math.random() * 1000) % messages.length);
  }, [token, messages.length]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const { data } = await api.get('/profile/me');
        setProfile(data);
      } catch (e) {
        // ignore
      }
    })();
  }, [token]);

  if (!token) {
    return <AuthScreen onAuthed={(t) => { setAuthToken(t); setToken(t); }} />
  }

  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateRows: '64px 1fr 180px' }}>
      {/* Fixed Header */}
      <header style={{ position: 'sticky', top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid #eee', background: '#fff', zIndex: 10 }}>
        <div>
          <div style={{ fontWeight: 700 }}>Hii{profile?.name ? `, ${profile.name}` : ''} 👋</div>
          <div style={{ fontSize: 12, color: '#666' }}>{messages[interactiveIdx]}</div>
        </div>
        <ProfileMenu profile={profile} onUpdated={setProfile} onLogout={() => { setAuthToken(null); setToken(null); }} />
      </header>

      {/* Scrollable Middle */}
      <main style={{ overflow: 'auto', padding: 16 }}>
        <ChallengeCard profile={profile} />
        <StreakBoard />
        <div style={{ marginTop: 16 }}>
          <h3>Pose Analysis</h3>
          <UploadPane onResult={setAnalysis} />
          {analysis && (
            <div style={{ marginTop: 16 }}>
              <pre style={{ background: '#f6f8fa', padding: 12, overflow: 'auto' }}>{JSON.stringify(analysis, null, 2)}</pre>
            </div>
          )}
        </div>
        <MeditationSection />
      </main>

      {/* Fixed Footer Chat */}
      <footer style={{ borderTop: '1px solid #eee', background: '#fff' }}>
        <ChatPane analysis={analysis} />
      </footer>
    </div>
  );
};

const inputStyle: React.CSSProperties = { padding: 8, border: '1px solid #ddd', borderRadius: 8 };

const fieldRow: React.CSSProperties = { display: 'grid', gap: 8 };

const labelStyle: React.CSSProperties = { fontSize: 12, color: '#555' };

function AuthScreen({ onAuthed }: { onAuthed: (token: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'male'|'female'|'other'>('other');
  const [level, setLevel] = useState<'beginner'|'intermediate'|'advanced'>('beginner');
  const [flexibility, setFlexibility] = useState<'low'|'medium'|'high'>('medium');
  const [goal, setGoal] = useState('alignment');
  const [pcosOrPcod, setPcosOrPcod] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', { email, password });
        onAuthed(data.token);
      } else {
        const { data } = await api.post('/auth/register', { email, password, name, age, gender, level, flexibility, goal, pcosOrPcod });
        onAuthed(data.token);
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
      <form onSubmit={submit} style={{ width: 360, display: 'grid', gap: 12, padding: 16, border: '1px solid #eee', borderRadius: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 20 }}>{isLogin ? 'Login' : 'Create account'}</div>
        <label style={labelStyle}>Email<input style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} type="email" required /></label>
        <label style={labelStyle}>Password<input style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} type="password" required /></label>
        {!isLogin && (
          <>
            <label style={labelStyle}>Name<input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required /></label>
            <label style={labelStyle}>Age<input style={inputStyle} value={age} onChange={e => setAge(parseInt(e.target.value, 10)||0)} type="number" min={5} /></label>
            <label style={labelStyle}>Gender<select style={inputStyle} value={gender} onChange={e => setGender(e.target.value as any)}>
              <option value="male">male</option>
              <option value="female">female</option>
              <option value="other">other</option>
            </select></label>
            {gender==='female' && (
              <label style={labelStyle}><input type="checkbox" checked={pcosOrPcod} onChange={e=>setPcosOrPcod(e.target.checked)} /> PCOS/PCOD</label>
            )}
            <label style={labelStyle}>Level<select style={inputStyle} value={level} onChange={e => setLevel(e.target.value as any)}>
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select></label>
            <label style={labelStyle}>Flexibility<select style={inputStyle} value={flexibility} onChange={e => setFlexibility(e.target.value as any)}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select></label>
            <label style={labelStyle}>Goal<input style={inputStyle} value={goal} onChange={e => setGoal(e.target.value)} /></label>
          </>
        )}
        {error && <div style={{ color: 'crimson', fontSize: 12 }}>{error}</div>}
        <button disabled={loading} style={{ padding: '10px 12px', borderRadius: 8 }}>{loading ? 'Please wait…' : (isLogin ? 'Login' : 'Register')}</button>
        <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ background: 'transparent', border: 0, color: '#555', textDecoration: 'underline' }}>
          {isLogin ? 'Create an account' : 'Have an account? Login'}
        </button>
      </form>
    </div>
  );
}

function ProfileMenu({ profile, onUpdated, onLogout }: { profile: any, onUpdated: (p:any)=>void, onLogout: ()=>void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<any>(profile || {});
  useEffect(()=>{ setDraft(profile || {}); }, [profile]);

  async function save() {
    const { data } = await api.put('/profile/me', draft);
    onUpdated(data);
    setEditing(false);
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #eee', padding: '6px 10px', borderRadius: 999 }}>
        <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#ddd', display: 'inline-block' }}></span>
        <span>{profile?.name || 'Profile'}</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #eee', borderRadius: 8, minWidth: 220, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          {!editing ? (
            <div style={{ display: 'grid' }}>
              <button style={{ textAlign: 'left', padding: 10 }} onClick={() => setEditing(true)}>Settings</button>
              <button style={{ textAlign: 'left', padding: 10 }} onClick={onLogout}>Logout</button>
            </div>
          ) : (
            <div style={{ padding: 10, display: 'grid', gap: 8 }}>
              <label style={labelStyle}>Name<input style={inputStyle} value={draft?.name||''} onChange={e=>setDraft({...draft, name: e.target.value})} /></label>
              <label style={labelStyle}>Age<input style={inputStyle} type="number" value={draft?.age||0} onChange={e=>setDraft({...draft, age: parseInt(e.target.value,10)||0})} /></label>
              <label style={labelStyle}>Gender<select style={inputStyle} value={draft?.gender||'other'} onChange={e=>setDraft({...draft, gender: e.target.value})}>
                <option value="male">male</option>
                <option value="female">female</option>
                <option value="other">other</option>
              </select></label>
              {draft?.gender==='female' && (
                <label style={labelStyle}><input type="checkbox" checked={!!draft?.pcosOrPcod} onChange={e=>setDraft({...draft, pcosOrPcod: e.target.checked})} /> PCOS/PCOD</label>
              )}
              <label style={labelStyle}>Level<select style={inputStyle} value={draft?.level||'beginner'} onChange={e=>setDraft({...draft, level: e.target.value})}>
                <option value="beginner">beginner</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select></label>
              <label style={labelStyle}>Flexibility<select style={inputStyle} value={draft?.flexibility||'medium'} onChange={e=>setDraft({...draft, flexibility: e.target.value})}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select></label>
              <label style={labelStyle}>Goal<input style={inputStyle} value={draft?.goal||''} onChange={e=>setDraft({...draft, goal: e.target.value})} /></label>
              <div style={{ display:'flex', gap: 8 }}>
                <button onClick={save}>Save</button>
                <button onClick={()=>setEditing(false)} style={{ background:'transparent' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChallengeCard({ profile }: { profile: any }) {
  const [open, setOpen] = useState(false);
  const [conditions, setConditions] = useState<string>('');
  const [plan, setPlan] = useState<any | null>(null);
  async function generate() {
    const list = conditions.split(',').map(s=>s.trim()).filter(Boolean);
    const { data } = await api.post('/challenge/generate', { conditions: list, pcosOrPcod: profile?.pcosOrPcod });
    setPlan(data);
    setOpen(false);
  }
  async function markToday() { await api.post('/activity/mark', { type: 'challenge' }); }
  return (
    <div style={{ marginBottom: 16, border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
      <button onClick={()=>setOpen(true)} style={{ padding: '10px 12px', borderRadius: 8 }}>Participate in your personalised 30-day challenge</button>
      {open && (
        <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 12, color: '#666' }}>List any conditions (e.g., thyroid) separated by commas.</div>
          <input style={inputStyle} value={conditions} onChange={e=>setConditions(e.target.value)} placeholder="thyroid, anxiety" />
          <button onClick={generate}>Generate Plan</button>
        </div>
      )}
      {plan && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Start: {plan.start}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginTop: 8 }}>
            {plan.plan.days.map((d: any) => (
              <div key={d.day} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
                <div>Day {d.day}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{d.asana}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={markToday}>Mark today's task as done</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StreakBoard() {
  const [items, setItems] = useState<{ date: string; done: boolean }[]>([]);
  useEffect(() => { (async()=>{ const { data } = await api.get('/activity/streak'); setItems(data.items); })(); }, []);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>Streak</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((it) => (
          <div key={it.date} title={it.date} style={{ width: 20, height: 20, borderRadius: '50%', background: it.done ? '#22c55e' : '#e5e7eb' }} />
        ))}
      </div>
    </div>
  );
}

function MeditationSection() {
  const [mood, setMood] = useState('calm');
  const [tracks, setTracks] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  useEffect(()=>{ (async()=>{ const { data } = await api.get('/music/tracks', { params: { mood } }); setTracks(data.tracks); setFavorites(data.favorites); })(); }, [mood]);
  async function fav(t:any) { const { data } = await api.post('/music/favorites', { track: t }); setFavorites(data.favorites); }
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h3 style={{ margin: 0 }}>Meditation music</h3>
        <select value={mood} onChange={e=>setMood(e.target.value as any)}>
          <option value="calm">calm</option>
          <option value="focused">focused</option>
          <option value="energize">energize</option>
        </select>
      </div>
      {favorites.length>0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: '#666' }}>Favorites</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {favorites.map((t:any)=> (
              <Track key={t.url} t={t} onFav={()=>{}} />
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {tracks.map((t:any)=> (
          <Track key={t.url} t={t} onFav={()=>fav(t)} />
        ))}
      </div>
    </div>
  );
}

function Track({ t, onFav }: { t:any, onFav: ()=>void }) {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 8, minWidth: 220 }}>
      <div style={{ fontWeight: 600 }}>{t.title}</div>
      <audio src={t.url} controls style={{ width: '100%' }} />
      <button onClick={onFav} style={{ marginTop: 6 }}>☆ Favorite</button>
    </div>
  );
}
