import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-light)',
        borderRadius: '2rem',
        padding: '0.5rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease',
      }}
    >
      {theme === 'light' ? (
        <Moon size={18} color="var(--text-primary)" />
      ) : (
        <Sun size={18} color="var(--text-primary)" />
      )}
      <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
        {theme === 'light' ? 'DARK' : 'LIGHT'}
      </span>
    </button>
  );
}