import { createServerClient } from '@supabase/ssr'
import {Database} from "@/lib/types";

export async function createServerAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.PRIVATE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('[SECURITY]: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables (.env).');
    }

    return createServerClient<Database>(
        url,
        serviceKey,
        {
            cookies: {
                getAll: () => [],
                setAll: () => {},
            },
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
            db: {
                schema: 'public'
            },
        }
    )
}