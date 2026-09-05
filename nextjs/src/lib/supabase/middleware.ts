import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcxhxxihtjshyjaoxoqh.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeGh4eGlodGpzaHlqYW94b3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjA3ODEsImV4cCI6MjEwNDE5Njc4MX0.wAbrPNvT-DzMDOB3JSB5hHt_LnPIiilRVqadff4Zor4';

    if (
        !supabaseUrl ||
        !supabaseAnonKey ||
        supabaseUrl.includes('YOURSUPABASE') ||
        supabaseUrl.includes('placeholder') ||
        supabaseAnonKey === 'YYY' ||
        supabaseAnonKey.includes('placeholder')
    ) {
        // In local/offline mode, check the session auth cookie
        const eytAuth = request.cookies.get('eyt_auth')?.value;
        if (eytAuth !== 'true' && request.nextUrl.pathname.startsWith('/app')) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { data, error } = await supabase.auth.getUser()
        if (
            (error || !data?.user) && request.nextUrl.pathname.startsWith('/app')
        ) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    } catch (err) {
        console.error('Supabase middleware error:', err)
        if (request.nextUrl.pathname.startsWith('/app')) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}