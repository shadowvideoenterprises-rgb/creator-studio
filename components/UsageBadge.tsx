'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { DollarSign } from 'lucide-react'

export function UsageBadge() {
  const [spend, setSpend] = useState(0)

  useEffect(() => {
    const fetchSpend = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('user_settings').select('total_spend').eq('user_id', user.id).single()
            if (data) setSpend(data.total_spend)
        }
    }
    fetchSpend()
  }, [])

  return (
    <div className="flex items-center gap-1 text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/5" title="Total API Spend">
        <DollarSign size={10} />
        {spend.toFixed(4)}
    </div>
  )
}
