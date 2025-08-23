
'use client'

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BrainCircuit } from 'lucide-react';

export default function AuthLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if(loading || user) {
         return (
            <div className="flex flex-col min-h-screen bg-background items-center justify-center">
                <BrainCircuit className="h-12 w-12 text-primary animate-pulse" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}
