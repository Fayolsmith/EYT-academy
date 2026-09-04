import { createBrowserClient } from '@supabase/ssr'
import { ClientType, SassClient } from "@/lib/supabase/unified";
import { Database } from "@/lib/types";

const defaultUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const defaultKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export function createSPAClient() {
    return createBrowserClient<Database>(
        defaultUrl,
        defaultKey
    )
}

export async function createSPASassClient() {
    const client = createSPAClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new SassClient(client as any, ClientType.SPA);
}

export async function createSPASassClientAuthenticated() {
    const client = createSPAClient();
    try {
        const user = await client.auth.getSession();
        if (!user.data || !user.data.session) {
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
        }
    } catch {
        // Fallback for demo/offline
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new SassClient(client as any, ClientType.SPA);
}