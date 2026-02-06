import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useJobStatus(jobId: string | null) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Waiting to start...');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!jobId) return;

    const checkStatus = async () => {
      const { data, error } = await supabase
        .from('job_progress')
        .select('progress, message, status')
        .eq('job_id', jobId)
        .single();

      if (data) {
        setProgress(data.progress);
        setMessage(data.message);
        setStatus(data.status);

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
        }
      }
    };

    const interval = setInterval(checkStatus, 1500);
    return () => clearInterval(interval);
  }, [jobId]);

  return { progress, message, status };
}