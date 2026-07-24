import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAuthErrorMessage } from '../../firebase/auth.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';

export function AuthCard({ mode }) {
  const { register, login, loginWithGoogle, isConfigured, configurationError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = mode === 'login';
  const action = isLogin ? 'Welcome back' : 'Create your account';
  const alternate = isLogin ? 'New to StackPilot?' : 'Already have an account?';
  const alternateLabel = isLogin ? 'Create account' : 'Sign in';
  const alternatePath = isLogin ? '/register' : '/login';
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const destination = location.state?.from ?? '/dashboard';

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const complete = async (callback) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await callback();
      navigate(destination, { replace: true });
    } catch (nextError) {
      setError(getAuthErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    complete(() => (isLogin ? login({ email: form.email, password: form.password }) : register(form)));
  };

  return (
    <section className="glass-panel w-full max-w-[420px] rounded-3xl p-6 shadow-glow-sm sm:p-8">
      <span className="inline-flex rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-xs font-medium text-brand-light">Private beta</span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">{action}</h1>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{isLogin ? 'Sign in to continue your development workspace.' : 'Start with a secure, focused developer workspace.'}</p>
      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        {!isLogin && <label className="block text-sm font-medium text-text-secondary">Name<Input className="mt-2" name="displayName" value={form.displayName} onChange={update} autoComplete="name" placeholder="Ada Lovelace" required disabled={!isConfigured || isSubmitting} /></label>}
        <label className="block text-sm font-medium text-text-secondary">Email<Input className="mt-2" name="email" value={form.email} onChange={update} type="email" autoComplete="email" placeholder="you@example.com" required disabled={!isConfigured || isSubmitting} /></label>
        <label className="block text-sm font-medium text-text-secondary">Password<Input className="mt-2" name="password" value={form.password} onChange={update} type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} placeholder="••••••••" minLength="6" required disabled={!isConfigured || isSubmitting} /></label>
        {(error || configurationError) && <p className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200" role="alert">{error ?? configurationError}</p>}
        <Button className="w-full" type="submit" disabled={!isConfigured || isSubmitting}>{isSubmitting && <LoaderCircle size={16} className="animate-spin" />}{isLogin ? 'Sign in' : 'Create account'}</Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-text-muted"><span className="h-px flex-1 bg-white/10" />or continue with<span className="h-px flex-1 bg-white/10" /></div>
      <Button className="w-full" variant="secondary" onClick={() => complete(loginWithGoogle)} disabled={!isConfigured || isSubmitting}><span className="text-base">G</span>Continue with Google</Button>
      <p className="mt-6 text-center text-sm text-text-secondary">{alternate} <Link to={alternatePath} className="font-medium text-brand-light hover:text-white">{alternateLabel}</Link></p>
    </section>
  );
}
