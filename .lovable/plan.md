

## Plan: OpenRouter-inspired sidebar layout with transaction history

### Overview
Redesign the Dashboard and Account areas to use a persistent left sidebar navigation (like OpenRouter), and add a "Recent Transactions" section to the Credits/Account page showing Stripe payment history.

### Architecture

```text
┌──────────────┬────────────────────────────────────┐
│  Sidebar     │  Main Content Area                 │
│              │                                    │
│  Logo        │  (varies by active section)        │
│  ─────────   │                                    │
│  Activity    │  Credits page shows:               │
│  Logs        │  - Balance card ($ X.XX)           │
│  Credits     │  - Buy Credits + Add Credits btn   │
│  ─────────   │  - Recent Transactions table       │
│  Settings ▾  │                                    │
│   Account    │                                    │
│   API Keys   │                                    │
│              │                                    │
│  (Admin)     │                                    │
└──────────────┴────────────────────────────────────┘
```

### Changes

**1. Create shared sidebar layout component** (`src/views/Layout/AppSidebar.tsx`)
- Left sidebar with navigation items: Activity (dashboard overview), Logs (spend logs), Credits
- Collapsible "Settings" section: Account (profile), API Keys
- Conditional "Admin" link (if user has admin role)
- Sticky sidebar, dark theme matching existing design
- Top: Logo + brand name
- Bottom: Sign out button

**2. Create layout wrapper** (`src/views/Layout/AppLayout.tsx`)
- Flex layout with sidebar + main content area
- Shared top-level component used by Dashboard, Account, and Admin routes

**3. Restructure routing** (`src/App.tsx`)
- Add nested routes under AppLayout: `/dashboard`, `/dashboard/logs`, `/dashboard/credits`, `/dashboard/account`, `/dashboard/keys`, `/admin`
- Or keep flat routes but wrap them all in AppLayout

**4. Refactor Account page into Credits page** (`src/views/Credits/CreditsPage.tsx`)
- Large balance display at top (like OpenRouter's `$ 5.69`)
- "Buy Credits" section with "Add Credits" button (existing pack selection)
- New "Recent Transactions" table showing Stripe payment history

**5. Create transaction history** 
- New DB table `credit_transactions` (migration): `id, user_id, amount_usd, credits_added, stripe_session_id, created_at`
- Update `verify-payment` edge function to insert a row on successful payment
- New repository + hook to fetch transaction history
- Display in a table: Date, Amount, Actions (future: Get invoice link)

**6. Refactor existing Dashboard content**
- Move DashboardHeader nav into the sidebar
- Dashboard main area shows: welcome, usage stats, API key list, models, integration guide
- Logs page shows the SpendLogTable in full-page view
- API Keys becomes its own sidebar section under Settings

### Database migration
```sql
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_usd numeric NOT NULL,
  credits_added numeric NOT NULL,
  stripe_session_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

### Files to create/modify
- **Create**: `src/views/Layout/AppSidebar.tsx`, `src/views/Layout/AppLayout.tsx`
- **Create**: `src/views/Credits/CreditsPage.tsx`, `src/views/Logs/LogsPage.tsx`
- **Create**: `src/data/repositories/transactionRepository.ts`, `src/models/types/transaction.types.ts`
- **Modify**: `src/App.tsx` (routing with layout wrapper)
- **Modify**: `src/views/Dashboard/Dashboard.tsx` (remove header nav, use layout)
- **Modify**: `src/views/Admin/AdminPanel.tsx` (remove header nav, use layout)
- **Modify**: `src/views/Account/AccountPage.tsx` (restructure as Settings > Account)
- **Modify**: `supabase/functions/verify-payment/index.ts` (insert transaction record)

