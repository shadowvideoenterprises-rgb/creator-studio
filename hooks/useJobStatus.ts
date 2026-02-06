'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function useJobStatus(jobId: string | null) {
  const [status, setStatus] = useState<string>('idle')
  const [progress, setProgress] = useState<number>(0)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    if (!jobId) return

    let intervalId: NodeJS.Timeout

    const fetchJob = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()
      
      if (data) {
        setStatus(data.status)
        setProgress(data.progress)
        setMessage(data.message)
      }
    }

    // 1. Fetch immediately
    fetchJob()

    // 2. Poll every 1 second (Backup for missed events)
    intervalId = setInterval(fetchJob, 1000)

    // 3. Realtime Subscription (Primary method)
    const channel = supabase
      .channel(`job-${jobId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${jobId}` }, (payload: any) => {
           setStatus(payload.new.status)
           setProgress(payload.new.progress)
           setMessage(payload.new.message)
      })
      .subscribe()

    return () => { 
      supabase.removeChannel(channel)
      clearInterval(intervalId) 
    }
  }, [jobId])

  return { status, progress, message }
}
