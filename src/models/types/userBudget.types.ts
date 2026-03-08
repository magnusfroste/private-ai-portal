export interface UserBudget {
  max_budget: number;
  spend: number;
  budget_remaining: number;
  purchased_credits_usd: number;
  litellm_user_id: string | null;
}
