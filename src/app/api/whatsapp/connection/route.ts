import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ connected: false })
    }

    const serviceClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const { data, error } = await serviceClient
      .from('wa_connections')
      .select('*')
      .eq('tenant_id', user.id)
      .single()

    if (error || !data) {
      console.log('No connection found for user:', user.id, error?.message)
      return NextResponse.json({ connected: false })
    }

    return NextResponse.json({
      connected: true,
      wabaId: data.waba_id,
      phoneNumberId: data.phone_number_id,
      phoneNumber: data.phone_number,
      businessName: data.business_name,
    })

  } catch (err: any) {
    console.error('Connection GET error:', err.message)
    return NextResponse.json({ connected: false })
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    await serviceClient
      .from('wa_connections')
      .delete()
      .eq('tenant_id', user.id)

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Connection DELETE error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
