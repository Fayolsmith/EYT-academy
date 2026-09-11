import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const isAppRoute = request.nextUrl.pathname.startsWith('/app');
    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname === '/login';

    // 1. Check EYT session auth cookie first (works for review build, demo accounts, and local sessions)
    const eytAuth = request.cookies.get('eyt_auth')?.value;
    if (eytAuth === 'true') {
        if (isAuthRoute) {
            const url = request.nextUrl.clone();
            url.pathname = '/app';
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (
        !supabaseUrl ||
        !supabaseAnonKey ||
        supabaseUrl.includes('YOURSUPABASE') ||
        supabaseUrl.includes('placeholder')
    ) {
        if (isAppRoute && eytAuth !== 'true') {
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

        const { data } = await supabase.auth.getUser()
        if (data?.user) {
            // Persist eyt_auth cookie for high-speed client/middleware parity
            supabaseResponse.cookies.set('eyt_auth', 'true', {
                path: '/',
                maxAge: 604800,
                sameSite: 'lax',
            });

            if (isAuthRoute) {
                const url = request.nextUrl.clone()
                url.pathname = '/app'
                return NextResponse.redirect(url)
            }
            return supabaseResponse;
        }

        // Only redirect to login if accessing protected /app routes without authentication
        if (isAppRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    } catch (err) {
        console.error('Supabase middleware error:', err)
        // If there's an error reaching Supabase and no eyt_auth cookie, protect /app
        if (isAppRoute && eytAuth !== 'true') {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}