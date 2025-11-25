import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { currentPassword, newPassword } = await request.json()

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Missing currentPassword or newPassword' },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'New password must be at least 6 characters long' },
                { status: 400 }
            )
        }

        // Create a Supabase client with service role key for admin operations
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Verify the requesting user is authenticated
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json(
                { error: 'No authorization header' },
                { status: 401 }
            )
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user || !user.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Verify current password in a separate admin client instance to avoid session conflicts
        const verifyClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { error: verifyError } = await verifyClient.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        })

        if (verifyError) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 403 }
            )
        }

        // Update the user's password using admin API (doesn't affect current session)
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        )

        if (updateError) {
            throw updateError
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Password change error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to change password' },
            { status: 500 }
        )
    }
}
