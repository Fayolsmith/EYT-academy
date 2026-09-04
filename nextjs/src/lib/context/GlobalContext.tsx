'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSPAClient } from '@/lib/supabase/client';
import { EYTService, UserProfile } from '@/lib/eyt-service';
import { UserRole, Database } from '@/lib/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

type User = {
    email: string;
    id: string;
    registered_at: Date;
    full_name?: string;
    role?: UserRole;
};

interface GlobalContextType {
    loading: boolean;
    user: User | null;
    profile: UserProfile | null;
    refreshUser: () => void;
    setRole: (role: 'owner' | 'parent') => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const loadData = async () => {
        try {
            if (EYTService.isSupabaseConfigured()) {
                const client = createSPAClient();
                const { data: { user: authUser } } = await client.auth.getUser();

                if (authUser) {
                    const res = await client
                        .from('profiles')
                        .select('*')
                        .eq('id', authUser.id)
                        .maybeSingle();

                    const prof = res.data as ProfileRow | null;

                    const currentProfile: UserProfile = {
                        id: authUser.id,
                        email: authUser.email || '',
                        full_name: prof?.full_name || authUser.email?.split('@')[0] || 'User',
                        role: prof?.role || 'parent',
                        phone: prof?.phone || null,
                        avatar_url: prof?.avatar_url || null,
                    };

                    setUser({
                        email: authUser.email!,
                        id: authUser.id,
                        registered_at: new Date(authUser.created_at),
                        full_name: currentProfile.full_name,
                        role: currentProfile.role,
                    });
                    setProfile(currentProfile);
                    return;
                }
            }

            // Local fallback / demo mode
            const localUser = EYTService.getCurrentUser();
            setUser({
                email: localUser.email,
                id: localUser.id,
                registered_at: new Date(),
                full_name: localUser.full_name,
                role: localUser.role,
            });
            setProfile(localUser);
        } catch (error) {
            console.error('Error loading user data:', error);
            const fallback = EYTService.getCurrentUser();
            setProfile(fallback);
        } finally {
            setLoading(false);
        }
    };

    const setRole = (role: 'owner' | 'parent') => {
        if (role === 'owner') {
            const updated = EYTService.switchToOwner();
            setProfile(updated);
            setUser({
                email: updated.email,
                id: updated.id,
                registered_at: new Date(),
                full_name: updated.full_name,
                role: updated.role,
            });
        } else {
            const updated = EYTService.switchToParent();
            setProfile(updated);
            setUser({
                email: updated.email,
                id: updated.id,
                registered_at: new Date(),
                full_name: updated.full_name,
                role: updated.role,
            });
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <GlobalContext.Provider value={{ loading, user, profile, refreshUser: loadData, setRole }}>
            {children}
        </GlobalContext.Provider>
    );
}

export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
};