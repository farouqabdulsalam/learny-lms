import React, { useState } from 'react';
import { ChevronDown, LogOut, Menu, UserRound, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { useStatus } from './StatusProvider';

export default function Navbar() {
  const { user, logout, switchRole, becomeInstructor } = useAuth();
  const status = useStatus();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const changeMode = async (role) => {
    if (!user || role === user.activeRole) return;
    setBusy(true); status.loading('Switching mode', `Opening ${role} workspace...`);
    try { await switchRole(role); status.success('Mode switched', `You are now in ${role} mode.`); navigate(role === 'instructor' ? '/instructor' : '/dashboard'); }
    catch (e) { status.error('Mode switch failed', e.response?.data?.message || 'Please try again.'); }
    finally { setBusy(false); }
  };

  const teach = async () => {
    setBusy(true); status.loading('Opening instructor mode', 'Preparing your teaching workspace...');
    try { await becomeInstructor(); status.success('Instructor access added', 'You can now switch between learning and teaching.'); navigate('/instructor'); }
    catch (e) { status.error('Could not enable teaching', e.response?.data?.message || 'Please try again.'); }
    finally { setBusy(false); }
  };

  return <header className="nav"><div className="container nav-inner">
    <Link to="/" className="brand"><span className="brand-mark">L</span><span>Learny</span></Link>
    <button className="icon-btn mobile-menu" onClick={() => setOpen(v => !v)}>{open ? <X/> : <Menu/>}</button>
    <nav className={open ? 'nav-links open' : 'nav-links'}>
      <NavLink to="/courses" onClick={() => setOpen(false)}>Explore</NavLink>
      {user?.activeRole === 'student' && <NavLink to="/dashboard" onClick={() => setOpen(false)}>My learning</NavLink>}
      {user?.activeRole === 'instructor' && <NavLink to="/instructor" onClick={() => setOpen(false)}>Instructor Studio</NavLink>}
      {user?.activeRole === 'admin' && <NavLink to="/admin" onClick={() => setOpen(false)}>Admin review</NavLink>}
    </nav>
    <div className="nav-actions">
      {user ? <>
        {user.roles?.filter(r => ['student','instructor'].includes(r)).length > 1 && <div className="mode-switch"><span>Mode</span><select value={user.activeRole} disabled={busy} onChange={e => changeMode(e.target.value)}><option value="student">Student</option><option value="instructor">Instructor</option></select><ChevronDown size={13}/></div>}
        {user.roles?.length === 1 && user.roles[0] === 'student' && <button className="btn ghost small" disabled={busy} onClick={teach}>Teach on Learny</button>}
        <Link className="user-chip" to={user.activeRole === 'admin' ? '/admin' : user.activeRole === 'instructor' ? '/instructor' : '/dashboard'}><UserRound size={16}/><span>{user.name.split(' ')[0]}</span></Link>
        <button className="icon-btn" onClick={() => { logout(); navigate('/'); }} title="Log out"><LogOut size={18}/></button>
      </> : <><Link className="btn ghost small" to="/login">Log in</Link><Link className="btn primary small" to="/register">Get started</Link></>}
    </div>
  </div></header>;
}
