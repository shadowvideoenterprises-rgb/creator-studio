import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseServer'
import Stripe from 'stripe'

// Force dynamic to prevent static generation attempts
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    
    // 1. Await headers (Next.js 15 requirement)
    const headerList = await headers()
    const sig = headerList.get('stripe-signature')

    if (!sig) throw new Error("No Stripe Signature")

    // 2. Initialize Stripe INSIDE the function to prevent Build Crashes
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { 
        apiVersion: '2026-01-28.clover' as any 
    })
    
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!endpointSecret) throw new Error("No Webhook Secret")

    // 3. Verify Event
    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    // 4. Handle Event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const creditAmount = parseInt(session.metadata?.amount || '0')

        if (userId && creditAmount > 0) {
            const { data: current } = await supabaseAdmin.from('user_credits').select('balance').eq('user_id', userId).single()
            const newBalance = (current?.balance || 0) + creditAmount

            await supabaseAdmin.from('user_credits').upsert({ user_id: userId, balance: newBalance })
            
            await supabaseAdmin.from('credit_transactions').insert({
                user_id: userId,
                amount: creditAmount,
                description: `Stripe Payment: ${session.id}`
            })
        }
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error("Webhook Handler Failed:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
