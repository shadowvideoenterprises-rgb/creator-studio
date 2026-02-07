import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'No User ID' }, { status: 400 })

  const { data } = await supabaseAdmin.from('user_credits').select('balance').eq('user_id', userId).single()
  return NextResponse.json({ balance: data?.balance || 0 })
}
