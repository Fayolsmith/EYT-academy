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
    logout: () => Promise<void>;
    setRole: (role: 'owner' | 'parent') => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const loadData = async () => {
        setLoading(true);
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

            // Check if there is an explicitly authenticated local session
            const localAuth = EYTService.getAuthenticatedUser();
            if (localAuth) {
                setUser({
                    email: localAuth.email,
                    id: localAuth.id,
                    registered_at: new Date(),
                    full_name: localAuth.full_name,
                    role: localAuth.role,
                });
                setProfile(localAuth);
            } else {
                setUser(null);
                setProfile(null);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setUser(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            if (EYTService.isSupabaseConfigured()) {
                const client = createSPAClient();
                await client.auth.signOut();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            EYTService.logout();
            setUser(null);
            setProfile(null);
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

        if (EYTService.isSupabaseConfigured()) {
            const client = createSPAClient();
            const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_OUT' || !session) {
                    EYTService.logout();
                    setUser(null);
                    setProfile(null);
                } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    loadData();
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, []);

    return (
        <GlobalContext.Provider value={{ loading, user, profile, refreshUser: loadData, logout, setRole }}>
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