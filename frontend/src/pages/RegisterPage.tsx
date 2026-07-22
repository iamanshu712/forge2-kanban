import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { RegisterCredentials } from '../types';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setGlobalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGlobalError('');

    try {
      await register(form);
      navigate('/boards', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      if (axiosErr.response?.data?.errors) {
        const flat: Record<string, string> = {};
        for (const [key, messages] of Object.entries(axiosErr.response.data.errors)) {
          flat[key] = messages[0];
        }
        setErrors(flat);
      } else {
        setGlobalError(axiosErr.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Doe', autoComplete: 'name' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
    { name: 'password_confirmation', label: 'Confirm Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
  ] as const;

  return (
    <div className="min-h-screen bg-kanban-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-kanban-accent rounded-2xl mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-kanban-muted mt-1">Start managing your projects</p>
        </div>

        {/* Card */}
        <div className="bg-kanban-surface border border-kanban-border rounded-2xl p-8 shadow-modal animate-fade-in">
          {globalError && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map(({ name, label, type, placeholder, autoComplete }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-kanban-text mb-1.5">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  className={`w-full bg-kanban-card border ${errors[name] ? 'border-red-500' : 'border-kanban-border'} rounded-xl px-4 py-3 text-kanban-text placeholder:text-kanban-muted focus:outline-none focus:ring-2 focus:ring-kanban-accent transition`}
                />
                {errors[name] && <p className="mt-1 text-xs text-red-400">{errors[name]}</p>}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-kanban-accent hover:bg-kanban-accent-hover text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-kanban-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-kanban-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
