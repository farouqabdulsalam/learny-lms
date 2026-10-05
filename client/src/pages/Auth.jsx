import React, { useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { useStatus } from '../components/StatusProvider';

const roleOptions = [
  {
    value: 'student',
    title: 'Student',
    icon: 'S',
    text: 'Browse courses, enroll, learn and track progress.'
  },
  {
    value: 'instructor',
    title: 'Instructor',
    icon: 'I',
    text: 'Create courses, add lessons and teach students.'
  },
  {
    value: 'both',
    title: 'Both',
    icon: 'B',
    text: 'Learn and teach from the same Learny account.'
  }
];

export default function Auth({ mode }) {
  const login = mode === 'login';
  const { login: doLogin, register } = useAuth();
  const status = useStatus();
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const submit = async e => {
    e.preventDefault();
    setErr('');
    setBusy(true);

    status.loading(
      login ? 'Signing you in' : 'Creating your account',
      login ? 'Checking your credentials...' : 'Setting up your Learny workspace...'
    );

    try {
      if (login) {
        const u = await doLogin({
          email: form.email,
          password: form.password
        });

        status.success('Login successful', 'Welcome back to Learny.');

        navigate(
          u?.activeRole === 'admin'
            ? '/admin'
            : u?.activeRole === 'instructor'
              ? '/instructor'
              : '/dashboard'
        );
      } else {
        const u = await register({
          name: form.name,
          email: form.email,
          password: form.password,
          roles:
            form.role === 'both'
              ? ['student', 'instructor']
              : [form.role]
        });

        status.success(
          'Account created',
          'Your Learny workspace is ready.'
        );

        navigate(
          u?.activeRole === 'instructor'
            ? '/instructor'
            : '/dashboard'
        );
      }
    } catch (e) {
      const message =
        e.response?.data?.message || 'Something went wrong.';

      setErr(message);
      status.error(
        login ? 'Login failed' : 'Registration failed',
        message
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-art-inner">
          <span className="pill">
            <Sparkles size={14} /> Learny
          </span>

          <h1>
            Make learning feel <em>lighter.</em>
          </h1>

          <p>
            One focused platform for structured courses, protected content
            and a workspace for people who want to teach too.
          </p>

          <div className="auth-stats">
            <span>
              <b>01</b>
              <small>Learn</small>
            </span>
            <span>
              <b>02</b>
              <small>Practice</small>
            </span>
            <span>
              <b>03</b>
              <small>Teach</small>
            </span>
          </div>
        </div>
      </div>

      <div className="auth-form">
        <Link className="brand" to="/">
          <span className="brand-mark">L</span> Learny
        </Link>

        <div className="form-wrap">
          <div className="eyebrow">
            {login ? 'WELCOME BACK' : 'CREATE YOUR ACCOUNT'}
          </div>

          <h2>
            {login
              ? 'Continue your learning.'
              : 'Choose how you will use Learny.'}
          </h2>

          <p>
            {login
              ? 'Sign in to open your current Learny workspace.'
              : 'Choose your account type. You can switch modes later if you choose Both.'}
          </p>

          {err && <div className="inline-error">{err}</div>}

          <form onSubmit={submit}>
            {!login && (
              <label>
                Full name
                <input
                  required
                  value={form.name}
                  onChange={e =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Your name"
                />
              </label>
            )}

            <label>
              Email address
              <input
                required
                type="email"
                value={form.email}
                onChange={e =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="you@example.com"
              />
            </label>

            <label>
              Password
              <div className="password-field">
                <input
                  required
                  minLength={6}
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={e =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="At least 6 characters"
                />

                <button
                  type="button"
                  onClick={() => setShow(v => !v)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {!login && (
              <>
                <div className="label-row">
                  <span>I want to use Learny as</span>
                </div>

                <div className="role-grid">
                  {roleOptions.map(option => (
                    <button
                      type="button"
                      key={option.value}
                      className={`role-option ${
                        form.role === option.value ? 'selected' : ''
                      }`}
                      onClick={() =>
                        setForm({ ...form, role: option.value })
                      }
                    >
                      <span className="role-icon">{option.icon}</span>

                      <span>
                        <b>{option.title}</b>
                        <small>{option.text}</small>
                      </span>

                      {form.role === option.value && (
                        <Check size={17} />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              className="btn primary full submit-btn"
              disabled={busy}
            >
              {busy ? (
                <>
                  <LoaderCircle className="spin" size={18} />
                  {login ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {login ? 'Log in' : 'Create account'}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="switch-auth">
            {login
              ? "Don't have an account? "
              : 'Already have an account? '}

            <Link to={login ? '/register' : '/login'}>
              {login ? 'Create one' : 'Log in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
