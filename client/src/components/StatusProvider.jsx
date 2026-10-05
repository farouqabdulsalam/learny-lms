import React, { createContext, useCallback, useContext, useState } from 'react';
import Toast from './Toast';

const StatusContext = createContext(null);
export function StatusProvider({ children }) {
  const [toast, setToast] = useState(null);
  const notify = useCallback((type, title, message) => setToast({ type, title, message, id: Date.now() }), []);
  const value = {
    loading: (title, message) => notify('loading', title, message),
    success: (title, message) => notify('success', title, message),
    error: (title, message) => notify('error', title, message),
    clear: () => setToast(null),
  };
  return <StatusContext.Provider value={value}>{children}<div className="toast-stack"><Toast toast={toast} onClose={() => setToast(null)} /></div></StatusContext.Provider>;
}
export const useStatus = () => useContext(StatusContext);
