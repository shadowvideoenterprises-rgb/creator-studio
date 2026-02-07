'use client'
import { useState, useEffect } from 'react'
import { Coins, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export function CreditBalance() {
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    const fetchBalance = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const res = await fetch(`/api/credits?userId=${user.id}`)
            const json = await res.json()
            setBalance(json.balance)
        }
    }
    fetchBalance()
  }, [])

  if (balance === null) return null

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
        <Coins size={14} className="text-amber-500" />
        <span className="text-amber-400 font-bold text-xs">{balance} Credits</span>
        <button className="ml-2 p-1 bg-amber-500 hover:bg-amber-400 text-black rounded-full transition-colors">
            <Plus size={10} />
        </button>
    </div>
  )
}
