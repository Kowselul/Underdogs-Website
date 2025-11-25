import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { newEmail } = await request.json()

        if (!newEmail) {
            return NextResponse.json(
                { error: 'Missing newEmail' },
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

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Update the user's email without confirmation
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            {
                email: newEmail,
                email_confirm: true
            }
        )

        if (updateError) {
            throw updateError
        }

        // Also update the email in profiles table
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ email: newEmail })
            .eq('id', user.id)

        if (profileError) {
            console.error('Profile update error:', profileError)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Email update error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update email' },
            { status: 500 }
        )
    }
}
