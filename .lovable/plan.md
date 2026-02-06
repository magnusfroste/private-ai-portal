

## Admin Panel - Hantera Anv&auml;ndare och Trial-nycklar

### Sammanfattning
Skapa en admin-panel p&aring; `/admin` d&auml;r en admin kan:
- Se alla anv&auml;ndare med deras profiler och nyckelstatus
- &Auml;ndra `max_trial_keys` per anv&auml;ndare
- Nollst&auml;lla `trial_keys_created` s&aring; anv&auml;ndare kan skapa nya nycklar
- &Auml;ndra globalt standardv&auml;rde f&ouml;r nya anv&auml;ndare

Ja, 5-dagars-gr&auml;nsen &auml;r satt i LiteLLM-proxyn (duration: '5d' i edge-funktionen), s&aring; den p&aring;verkas inte av admin-panelen.

---

### Steg 1: Databasschema - Roller (S&auml;kerhet)

Skapa en separat `user_roles`-tabell (roller ska aldrig lagras i profiles-tabellen av s&auml;kerhetssk&auml;l):

```sql
-- Enum f&ouml;r roller
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Rolltabell
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer-funktion f&ouml;r att kolla roller (undviker RLS-rekursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS-policies f&ouml;r user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

Sedan l&auml;gga till admin-rollen f&ouml;r ditt anv&auml;ndarkonto (du beh&ouml;ver manuellt ange r&auml;tt user_id).

---

### Steg 2: Edge Function - Admin API

Skapa en `admin-users` edge function som hanterar admin-&aring;tg&auml;rder server-side (med rollkontroll):

**Endpoints:**
- `GET` - H&auml;mta alla anv&auml;ndare med profiler och nyckelr&auml;knare
- `PATCH` - Uppdatera en anv&auml;ndares `max_trial_keys` eller nollst&auml;ll `trial_keys_created`

Funktionen verifierar att den som anropar har admin-roll via `has_role()`-funktionen innan n&aring;gon &aring;tg&auml;rd utf&ouml;rs.

---

### Steg 3: Frontend - Admin-sida

**Nya filer (separation of concerns):**

| Lager | Fil | Ansvar |
|-------|-----|--------|
| Types | `src/models/types/admin.types.ts` | Typedefinitioner f&ouml;r admin-data |
| Data | `src/data/repositories/adminRepository.ts` | API-anrop till admin edge function |
| Model | `src/models/services/adminService.ts` | Aff&auml;rslogik f&ouml;r admin |
| View | `src/pages/Admin.tsx` | Admin-sidans route |
| View | `src/views/Admin/AdminPanel.tsx` | Huvudkomponent |
| View | `src/views/Admin/components/UserTable.tsx` | Anv&auml;ndartabell |
| View | `src/views/Admin/components/EditUserDialog.tsx` | Redigera anv&auml;ndare |
| Hook | `src/views/Admin/hooks/useAdminData.ts` | Data-hook f&ouml;r admin |

**UserTable visar:**
- Namn, e-post, f&ouml;retag
- Trial keys: skapade / max
- Antal API-nycklar
- Registreringsdatum
- &Aring;tg&auml;rder: Redigera, Nollst&auml;ll nycklar

**EditUserDialog:**
- &Auml;ndra `max_trial_keys` (slider eller input)
- Nollst&auml;ll `trial_keys_created` till 0
- Visa nuvarande v&auml;rden

---

### Steg 4: Route och Navigation

- L&auml;gg till `/admin`-route i `App.tsx`
- L&auml;gg till admin-l&auml;nk i `DashboardHeader` (visas bara f&ouml;r admin-anv&auml;ndare)
- Admin-sidan skyddas med rollkontroll - icke-admins omdirigeras

---

### Tekniska detaljer

**S&auml;kerhet:**
- Alla admin-&aring;tg&auml;rder g&aring;r via edge function med service role key
- Rollkontroll sker server-side med `has_role()`
- Frontend g&ouml;r ocks&aring; en rollkontroll f&ouml;r att d&ouml;lja admin-gr&auml;nssnittet, men det &auml;r inte s&auml;kerhetsmekanismen

**Admin-roll setup:**
- Efter migrationen beh&ouml;ver vi manuellt l&auml;gga till din anv&auml;ndar-ID som admin
- Detta g&ouml;rs med en INSERT i `user_roles`-tabellen

**Implementeringsordning:**
1. Databasmigration (roller-tabell + funktion)
2. S&auml;tt admin-roll p&aring; ditt konto
3. Edge function `admin-users`
4. Frontend-komponenter (types, repo, service, views)
5. Routes och navigation
