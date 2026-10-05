import React, { useEffect } from 'react';
import { CheckCircle2, CircleAlert, LoaderCircle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onClose, toast.type === 'loading' ? 10000 : 4200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;
  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? CircleAlert : LoaderCircle;
  return (
    <div className={`toast toast-${toast.type}`} role="status">
      <Icon className={toast.type === 'loading' ? 'spin' : ''} size={18} />
      <div><b>{toast.title}</b><span>{toast.message}</span></div>
      {toast.type !== 'loading' && <button onClick={onClose} aria-label="Close"><X size={15}/></button>}
    </div>
  );
}
