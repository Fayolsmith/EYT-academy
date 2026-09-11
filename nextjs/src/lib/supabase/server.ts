import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ClientType, SassClient } from "@/lib/supabase/unified";
import { Database } from "@/lib/types";

const defaultUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const defaultKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function createSSRClient() {
    const cookieStore = await cookies()

    return createServerClient<Database>(
        defaultUrl,
        defaultKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            }
        }
    )
}

export async function createSSRSassClient() {
    const client = await createSSRClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new SassClient(client as any, ClientType.SERVER);
}