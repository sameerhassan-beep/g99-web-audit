import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const login = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      redirect('/login?message=Could not authenticate user');
    }

    redirect('/dashboard');
  };

  const signup = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      redirect('/login?message=Could not sign up user');
    }

    // If session is null, it means email confirmation is required by Supabase settings
    if (!data.session) {
      redirect('/login?message=Check your email to confirm your account');
    }

    redirect('/dashboard');
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-4 text-center">G99 WebAudit</h1>
        <form className="flex-1 flex flex-col w-full justify-center gap-4 text-slate-900">
          <label className="text-sm font-bold text-slate-500" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 mb-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            name="email"
            placeholder="you@example.com"
            required
          />
          <label className="text-sm font-bold text-slate-500" htmlFor="password">
            Password
          </label>
          <input
            className="rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 mb-6 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
          <button
            formAction={login}
            className="bg-black hover:bg-slate-800 text-white rounded-xl px-4 py-3 font-bold transition-all shadow-sm"
          >
            Sign In
          </button>
          <button
            formAction={signup}
            className="border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl px-4 py-3 font-bold transition-all shadow-sm"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
