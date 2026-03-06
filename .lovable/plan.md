

## Plan: Lägg till Claude Code-flik i Integration Guide

Utöka `IntegrationGuide.tsx` med `Tabs`-komponenten (redan finns i projektet) för att visa två flikar:

**Flik 1 — OpenAI API** (befintligt innehåll: endpoint URL + curl-exempel)

**Flik 2 — Claude Code** med instruktioner:
```bash
export ANTHROPIC_BASE_URL=https://api.autoversio.ai
export ANTHROPIC_API_KEY=<din-api-nyckel>
claude
```
Plus kort förklaring att LiteLLM-proxyn automatiskt översätter Anthropic Messages API till backend-formatet.

### Filändringar
| Fil | Ändring |
|---|---|
| `src/views/Dashboard/components/IntegrationGuide.tsx` | Importera `Tabs/TabsList/TabsTrigger/TabsContent`, wrappa befintligt innehåll i "OpenAI API"-tab, lägg till "Claude Code"-tab med env-var-instruktioner och copy-knappar |

