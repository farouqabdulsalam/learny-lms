import React from 'react';
export default function ProgressBar({ value = 0 }) {
  const safe = Math.min(100, Math.max(0, Number(value) || 0));
  return <div className="progress"><span style={{ width: `${safe}%` }} /></div>;
}
