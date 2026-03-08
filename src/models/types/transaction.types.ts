export interface CreditTransaction {
  id: string;
  user_id: string;
  amount_usd: number;
  credits_added: number;
  stripe_session_id: string | null;
  created_at: string;
}
