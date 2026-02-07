import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import Stripe from 'stripe'

// FIX: Cast apiVersion to 'any' to prevent TypeScript errors on future SDK versions
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-01-28.clover' as any, 
})

export async function POST(req: Request) {
  try {
    const { userId, plan = 'credits_500' } = await req.json()

    if (!userId) return NextResponse.json({ error: 'No User ID' }, { status: 400 })
    
    const lineItems = [{
        price_data: {
            currency: 'usd',
            product_data: {
                name: '500 Creator Credits',
                description: 'Generate ~50 Scripts or 25 Images',
            },
            unit_amount: 1000, 
        },
        quantity: 1,
    }]

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/dashboard?payment=success`,
        cancel_url: `${req.headers.get('origin')}/dashboard?payment=cancelled`,
        metadata: {
            userId: userId,
            type: 'credit_refill',
            amount: 500
        }
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error("Stripe Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
