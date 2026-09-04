'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRegisterRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/signup');
    }, [router]);

    return (
        <div className="flex items-center justify-center p-8">
            <div className="text-xs text-[#6B7280]">Redirecting to Registration...</div>
        </div>
    );
}