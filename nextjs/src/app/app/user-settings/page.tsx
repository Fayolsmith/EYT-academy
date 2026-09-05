'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserSettingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/settings');
  }, [router]);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#1E4E8C] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-[#1E4E8C]">Redirecting to Settings...</span>
      </div>
    </div>
  );
}