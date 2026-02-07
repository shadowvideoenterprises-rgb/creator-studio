'use client'
import { useState } from 'react'
import { CreditCard, Loader2, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ToastProvider'

export function BuyCreditsButton() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    try {
        const res = await fetch('/api/stripe/checkout', {
            method: 'POST',
            body: JSON.stringify({ userId: user?.id })
        })
        const data = await res.json()
        
        if (data.url) {
            window.location.href = data.url // Redirect to Stripe
        } else {
            toast("Payment Error", "error")
        }
    } catch (e) { toast("Network Error", "error") }
    setLoading(false)
  }

  return (
    <button 
        onClick={handleBuy}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-105"
    >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
        <span>Get 500 Credits ($10)</span>
    </button>
  )
}
