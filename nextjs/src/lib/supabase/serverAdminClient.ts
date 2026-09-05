import { createServerClient } from '@supabase/ssr'
import {Database} from "@/lib/types";

export async function createServerAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcxhxxihtjshyjaoxoqh.supabase.co';
    const serviceKey = process.env.PRIVATE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeGh4eGlodGpzaHlqYW94b3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODYyMDc4MSwiZXhwIjoyMTA0MTk2NzgxfQ.PDf_gM4yhTg1ixyA5uK6z-wVpOB4S3LwLQ_yMboG8vA';

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