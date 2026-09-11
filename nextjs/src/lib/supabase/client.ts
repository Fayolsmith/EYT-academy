import { createBrowserClient } from '@supabase/ssr'
import { ClientType, SassClient } from "@/lib/supabase/unified";
import { Database } from "@/lib/types";

const defaultUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const defaultKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let spaClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createSPAClient() {
    if (!spaClient) {
        if (!defaultUrl || !defaultKey) {
            console.warn('[SECURITY]: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables.');
        }
        spaClient = createBrowserClient<Database>(
            defaultUrl,
            defaultKey
        );
    }
    return spaClient;
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
            const hasLocalAuth = typeof document !== 'undefined' && document.cookie.includes('eyt_auth=true');
            if (!hasLocalAuth && typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    } catch {
        // Fallback for demo/offline
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new SassClient(client as any, ClientType.SPA);
}