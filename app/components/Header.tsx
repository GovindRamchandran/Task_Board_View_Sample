'use client';

import { useAuth } from '../context/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '@/utils/firestore';
import Link from 'next/link';
import DarkModeToggle from './DarkModeToggle';
import { useRouter } from "next/navigation";

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <header className="w-full flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
      <Link href="/" className="text-2xl font-extrabold tracking-wide text-gray-800 dark:text-gray-200">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
          Task
        </span>
        <span className="italic">Board</span>
      </Link>

      <div className="flex items-center gap-4">
        <DarkModeToggle />
        {user && (
          <>
            <span className="text-sm text-black dark:text-white hidden sm:inline">
              {user.email}
            </span>
            <button
              onClick={() => {
                signOut(auth);
                router.push('/');
              }}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 active:scale-95 transition cursor-pointer"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
