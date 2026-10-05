import React from 'react';
import { Link } from 'react-router-dom';
export default function NotFound() { return <div className="state-card page"><div className="eyebrow">404</div><h1>That page drifted away.</h1><p>Let's get you back to something useful.</p><Link className="btn primary" to="/">Back home</Link></div>; }
