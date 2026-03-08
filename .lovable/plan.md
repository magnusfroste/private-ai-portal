

## Plan: Utveckla profilsidan + förbered för Stripe credits-köp

Ja, ni har helt rätt — LiteLLM fortsätter som proxy och portalen är användarens vy för att hantera nycklar, se användning och köpa credits. OpenRouter är en bra inspirationskälla.

Detta är ett stort scope, så jag föreslår att vi bryter ner det i etapper:

### Etapp 1: Profilsida (denna iteration)

Skapa en dedikerad `/account`-sida med tre sektioner:

**1. Profilinformation** — Visa/redigera namn, email, företag
**2. Subscription & Credits** — Visa aktuell plan (Free Trial), credits kvar, trial keys använda, uppgraderingsknapp (förberedd för Stripe)
**3. Usage Overview** — Spend per modell (data från LiteLLM spend logs), visualiserat med recharts (redan installerat)

Nya filer:
- `src/pages/Account.tsx` — route-wrapper
- `src/views/Account/AccountPage.tsx` — huvudvy
- `src/views/Account/components/ProfileSection.tsx` — profilredigering
- `src/views/Account/components/SubscriptionSection.tsx` — plan + credits
- `src/views/Account/components/UsageOverview.tsx` — spend per modell (recharts)
- `src/views/Account/hooks/useAccountData.ts` — hook som samlar data
- `src/data/repositories/profileRepository.ts` — uppdatera med `update`-metod
- `src/models/services/profileService.ts` — uppdatera med `updateProfile`-metod

Route i `App.tsx`: lägg till `/account`.
Navigering: lägg till Account-länk i `DashboardHeader`.

### Etapp 2: Stripe-integration (nästa iteration)

Aktivera Stripe via Lovable-verktyget, skapa checkout-sessioner för credit-köp. Credits läggs till i LiteLLM via `/key/update` med ny budget.

### Etapp 3: Landingssida inspirerad av OpenRouter (framtida)

Förbättra Index-sidan med:
- Stats-banner (antal tokens, modeller, användare)
- Featured Models-sektion med priser
- Bättre pricing-sektion

---

**Ska vi börja med Etapp 1 (profilsidan)?** Stripe-integrationen kräver att vi först aktiverar Stripe-verktyget, vilket vi gör i Etapp 2.

