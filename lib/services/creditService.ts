import { supabaseAdmin } from '@/lib/supabaseServer';

export class CreditService {
  
  static async getBalance(userId: string): Promise<number> {
    const { data } = await supabaseAdmin.from('user_credits').select('balance').eq('user_id', userId).single();
    return data?.balance || 0;
  }

  static async charge(userId: string, cost: number, description: string): Promise<boolean> {
    // 1. Check Balance
    const balance = await this.getBalance(userId);
    if (balance < cost) return false;

    // 2. Deduct
    const { error } = await supabaseAdmin.from('user_credits').update({ balance: balance - cost }).eq('user_id', userId);
    if (error) return false;

    // 3. Log Transaction
    await supabaseAdmin.from('credit_transactions').insert({
        user_id: userId,
        amount: -cost,
        description: description
    });

    return true;
  }
}
