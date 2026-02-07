import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseServer'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' })
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature') as string

  let event: Stripe.Event

  try {
    if (!endpointSecret) throw new Error("No Webhook Secret")
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const creditAmount = parseInt(session.metadata?.amount || '0')

    if (userId && creditAmount > 0) {
        // 1. Get Current Balance
        const { data: current } = await supabaseAdmin.from('user_credits').select('balance').eq('user_id', userId).single()
        const newBalance = (current?.balance || 0) + creditAmount

        // 2. Update Balance
        await supabaseAdmin.from('user_credits').upsert({ user_id: userId, balance: newBalance })
        
        // 3. Log Transaction
        await supabaseAdmin.from('credit_transactions').insert({
            user_id: userId,
            amount: creditAmount,
            description: `Stripe Payment: ${session.id}`
        })
        console.log(`Credited ${creditAmount} to User ${userId}`)
    }
  }

  return NextResponse.json({ received: true })
}
