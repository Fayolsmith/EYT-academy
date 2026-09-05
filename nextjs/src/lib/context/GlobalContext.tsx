'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
    isParentPreview: boolean;
    refreshUser: () => void;
    logout: () => Promise<void>;
    previewAsParent: () => void;
    exitParentPreview: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [realProfile, setRealProfile] = useState<UserProfile | null>(null);
    const [isParentPreview, setIsParentPreview] = useState(false);

    const loadData = useCallback(async () => {
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
                    setRealProfile(currentProfile);
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
                setRealProfile(localAuth);
            } else {
                setUser(null);
                setRealProfile(null);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setUser(null);
            setRealProfile(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = async () => {
        setLoading(true);
        setIsParentPreview(false);
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
            setRealProfile(null);
            setLoading(false);
        }
    };

    /**
     * Preview as Parent: STRICTLY restricted to authenticated Owner accounts (Mrs Sarah).
     * A parent session can NEVER invoke this, and no reverse "preview as owner" exists.
     */
    const previewAsParent = () => {
        if (realProfile?.role !== 'owner' && user?.role !== 'owner') {
            console.error('[SECURITY AUDIT] Unauthorized attempt to invoke previewAsParent by non-owner session:', user?.email);
            return;
        }
        setIsParentPreview(true);
    };

    const exitParentPreview = () => {
        setIsParentPreview(false);
    };

    useEffect(() => {
        loadData();

        if (EYTService.isSupabaseConfigured()) {
            const client = createSPAClient();
            const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_OUT' || !session) {
                    EYTService.logout();
                    setUser(null);
                    setRealProfile(null);
                    setIsParentPreview(false);
                } else if (session) {
                    loadData();
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [loadData]);

    // When Owner activates parent preview, render simulated parent profile for QA
    const effectiveProfile: UserProfile | null = realProfile
        ? isParentPreview && realProfile.role === 'owner'
            ? {
                  ...realProfile,
                  role: 'parent',
                  full_name: `${realProfile.full_name} (Parent View QA)`,
              }
            : realProfile
        : null;

    return (
        <GlobalContext.Provider
            value={{
                loading,
                user,
                profile: effectiveProfile,
                isParentPreview,
                refreshUser: loadData,
                logout,
                previewAsParent,
                exitParentPreview,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
}

export function useGlobal() {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
}