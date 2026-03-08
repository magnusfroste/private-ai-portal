

## Improvements Found

After reviewing the admin panel, edge function, frontend components, RLS policies, and database state, here are the issues and improvements:

### 1. RLS Policy Bug — All Policies Are Restrictive (CRITICAL)
All RLS policies on `user_roles` use `RESTRICTIVE` mode (indicated by `Permissive: No`). In Postgres, restrictive policies are combined with AND, meaning a user needs to pass **all** policies simultaneously. This makes the "Admins can view all roles" policy useless because it conflicts with "Users can view own roles" — an admin trying to view another user's role fails the `auth.uid() = user_id` check.

**Fix:** Change the three `user_roles` policies to `PERMISSIVE` (the default). Drop and recreate them without `AS RESTRICTIVE`.

### 2. Same RLS Bug on `profiles`, `api_keys`, `token_usage`
All existing policies across these tables are also restrictive. This likely causes issues if you ever add a second policy on the same operation. Not immediately broken for single-policy-per-operation cases, but should be fixed for correctness.

**Fix:** Recreate the policies as permissive.

### 3. Admin Edge Function — Missing `try/catch` on `req.json()`
In the PATCH handler, `await req.json()` can throw if the body is malformed. This would result in an unhandled error and a 500 with no useful message.

**Fix:** Wrap in try/catch with a 400 response for invalid JSON.

### 4. Admin Edge Function — No Validation on `user_id` Format
The `user_id` from the PATCH body is passed directly to `.eq("id", user_id)` without UUID format validation. While not a SQL injection risk (Supabase SDK parameterizes), it could cause confusing errors.

**Fix:** Add basic UUID format validation.

### 5. Frontend — `EditUserDialog` Doesn't Include Reset Option
The dialog only lets admins change `max_trial_keys`. The reset button is separate in the table. It would be more cohesive to include a "Reset trial keys" button inside the edit dialog as well.

**Fix:** Add a reset button inside `EditUserDialog`.

### 6. Frontend — No Confirmation for Reset Action
Clicking the reset button in `UserTable` immediately resets without confirmation. This is a destructive action.

**Fix:** Add an `AlertDialog` confirmation before resetting.

### 7. Missing Error Boundary on Admin Route
If the admin page crashes, the whole app breaks. No error boundary wraps it.

**Fix:** Add a simple error boundary or use React Router's `errorElement`.

---

### Implementation Priority

1. **Fix RLS policies** (critical — current restrictive policies will block admin from viewing other users' roles)
2. **Edge function hardening** (try/catch, UUID validation)
3. **Reset confirmation dialog** (UX safety)
4. **Move reset into EditUserDialog** (UX cohesion)
5. **Error boundary** (resilience)

