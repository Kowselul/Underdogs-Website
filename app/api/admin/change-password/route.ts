import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { userId, newPassword } = await request.json()

        if (!userId || !newPassword) {
            return NextResponse.json(
                { error: 'Missing userId or newPassword' },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
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

        // Verify the requesting user is an admin
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json(
                { error: 'No authorization header' },
                { status: 401 }
            )
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if user is admin and if they are the owner
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('is_admin, username')
            .eq('id', user.id)
            .single()

        if (profileError || !profile?.is_admin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        // Only the owner (Kowse) can change other users' passwords
        const isOwner = profile.username.toLowerCase() === 'kowse'
        if (!isOwner) {
            return NextResponse.json(
                { error: 'Only the owner can change other users\' passwords' },
                { status: 403 }
            )
        }

        // Update the user's password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
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
