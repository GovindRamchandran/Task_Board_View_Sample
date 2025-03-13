"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthProvider";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from "@/utils/firestore";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/boards');
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="grid place-items-center min-h-screen p-6 font-[family-name:var(--font-geist-sans)]">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md space-y-4"
      >
        <h2 className="text-3xl font-bold text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-[#635FC7] text-white py-2 hover:bg-indigo-300 cursor-pointer rounded-md"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}