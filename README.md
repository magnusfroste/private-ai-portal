# Customer Portal for LiteLLM Proxy

## What is LiteLLM?

[**LiteLLM**](https://github.com/BerriAI/litellm) is an open-source proxy server that provides a **unified API interface** for 100+ LLM providers (OpenAI, Anthropic, Azure, Google, AWS, etc.). It handles:

- **Single API endpoint** for all LLM providers
- **Cost tracking & rate limiting** per user/team
- **Standardized OpenAI-compatible API** (Chat Completions, Embeddings, Image Generation)
- **Virtual keys** with spend limits and model restrictions
- **Load balancing** across multiple model deployments

LiteLLM is trusted by thousands of companies and powers production AI infrastructure worldwide.

---

## Why This Portal? Key Differentiators

### 🔒 Private AI - Your Data Stays Yours

Unlike public APIs where your prompts and data are processed by third parties, this portal gives you **full control over your AI infrastructure**:

- **Self-hosted LLMs**: Run models on your own infrastructure
- **Bring Your Own Keys**: Use your own provider API keys
- **No telemetry**: No third-party logging or data collection
- **Data sovereignty**: Comply with GDPR, HIPAA, and other regulations

### 🌉 API Compatibility Bridge

LiteLLM acts as a universal translator between different LLM APIs:

- **Claude Messages → OpenAI Completions**: Claude Code uses Anthropic's Messages API, but LiteLLM bridges this to any OpenAI-compatible endpoint
- **Format normalization**: Standardize across providers with different API formats
- **Provider agnostic**: Switch between OpenAI, Anthropic, Azure, and self-hosted models without code changes

### 💰 Cost Control & Transparency

- Per-user budgets with automatic enforcement
- Real-time spend tracking
- No surprise bills with transparent pricing

---

## Portal Overview

This is a **customer-facing portal** built on top of LiteLLM proxy, providing:

### 🔑 API Key Management
- Users can create and manage their own API keys
- Each key is a LiteLLM virtual key with configurable spend limits
- Real-time usage tracking per key
- Easy integration guide with OpenAI SDK and Claude Code
- **Claude Code compatible**: Set `ANTHROPIC_BASE_URL` to proxy for private AI workflows

### 💬 Chat Playground
- Direct browser-based chat interface to test models
- Support for reasoning models (extended thinking)
- Streaming responses with real-time display
- Conversation history persistence
- Model selector with pricing info

### 📊 Model Catalog
- Browse all available LLM models with pricing
- Filter by provider, capabilities, and mode
- Compare context windows and token costs
- Integration guides for popular AI coding agents

### 💰 Credit & Budget System
- Users purchase credits in USD
- LiteLLM budget enforcement per user
- Transaction history and usage analytics
- Admin controls for budget allocation

### 👨‍💼 Admin Dashboard
- User management with LiteLLM user provisioning
- Model curation (enable/disable models)
- Credit overview and spend tracking
- Stripe integration for payments
- Site-wide settings customization

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CUSTOMER PORTAL                        │
├─────────────────────────────────────────────────────────────┤
│  Landing Page  │  Auth  │  Chat  │  Dashboard  │  Admin     │
└────────┬────────────────┬────────────────────────────────────┘
         │                │
         ▼                ▼
┌─────────────────┐  ┌─────────────────┐
│    SUPABASE     │  │  SUPABASE       │
│  - Auth         │  │  FUNCTIONS      │
│  - Database     │  │  - chat-play-   │
│  - Storage      │  │    ground       │
└─────────────────┘  │  - create-      │
                     │    litellm-user │
                     └────────┬────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │   LITELLM PROXY │
                     │  - Virtual Keys │
                     │  - Rate Limits  │
                     │  - Cost Tracking│
                     └────────┬────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   ┌──────────┐         ┌──────────┐         ┌──────────┐
   │ OpenAI   │         │Anthropic │         │  Azure   │
   └──────────┘         └──────────┘         └──────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui (Radix) |
| State | TanStack Query |
| Routing | React Router v6 |
| Backend | Supabase (Auth + Database + Functions) |
| Proxy | LiteLLM |
| Payments | Stripe |

---

## Key Features for Developers

### 1. OpenAI-Compatible API
```bash
curl https://api.yourdomain.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello"}]}'
```

### 2. Claude Code Integration
```bash
export ANTHROPIC_BASE_URL=https://api.yourdomain.com
export ANTHROPIC_API_KEY=<your-api-key>
claude
```

### 3. Real-time Streaming
Server-Sent Events (SSE) streaming for chat responses, including reasoning content from extended thinking models.

### 4. Budget Controls
Per-user spend limits enforced by LiteLLM's built-in budget system.

---

## Database Schema

**Core Tables:**
- `profiles` - User profiles with LiteLLM user ID
- `api_keys` - Virtual API keys linked to LiteLLM
- `curated_models` - Available models with pricing
- `user_budgets` - Credit balances and LiteLLM budget sync
- `transactions` - Credit purchase history
- `site_settings` - CMS-like configuration
- `chat_conversations` - Saved chat sessions

---

## LiteLLM Secrets in Supabase

The portal communicates with LiteLLM proxy through **Supabase Edge Functions**. Sensitive credentials are stored securely as **Supabase Secrets**.

### Self-Hosted LiteLLM

Unlike managed AI services, **LiteLLM is self-hosted** on your own infrastructure. This means:

- Full control over your LLM deployment
- Private data never leaves your servers
- Can connect to self-hosted models (Ollama, vLLM, LocalAI, etc.)
- Same security model as running local private AI models

### Required Secrets

| Secret Name | Description |
|------------|-------------|
| `LITELLM_MASTER_KEY` | Master key for LiteLLM proxy authentication |
| `LITELLM_API_BASE` | Base URL for your self-hosted LiteLLM instance |

### Stripe Secrets

| Secret Name | Description |
|------------|-------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key for payments |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret for payment events |
| `STRIPE_PRICE_ID` | Stripe Price ID for credit packages |

### Additional Provider Secrets (Optional)

Depending on which LLM providers you configure in LiteLLM:

| Secret Name | Provider |
|------------|----------|
| `OPENAI_API_KEY` | OpenAI |
| `ANTHROPIC_API_KEY` | Anthropic |
| `AZURE_API_KEY` | Azure OpenAI |
| `GOOGLE_API_KEY` | Google AI |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_KEY` | AWS Bedrock |
| `OLLAMA_API_KEY` | Ollama (local models) |
| `LOCALAI_API_KEY` | LocalAI (local models) |

### Setting Up Secrets

1. Go to **Supabase Dashboard → Your Project → Edge Functions → Secrets**
2. Add each required secret as a key-value pair
3. The Edge Functions will automatically have access to these environment variables

### How It Works

```
Portal (Frontend)
    ↓
Supabase Auth + Database
    ↓
Supabase Edge Functions
    ├─ chat-playground
    ├─ create-litellm-user
    ├─ check-proxy-status
    └─ stripe-status
    ↓ (uses LITELLM_MASTER_KEY)
Self-Hosted LiteLLM Proxy
    ├─ Virtual API keys with budgets
    ├─ User authentication
    └─ Rate limiting
    ↓ (uses provider API keys or local models)
LLM Providers / Self-Hosted Models
```

---

## Summary

This portal transforms LiteLLM proxy into a **full-featured SaaS product** with:
- Self-service user onboarding (Supabase Auth)
- API key self-management
- Built-in chat interface for model testing
- Credit-based billing system
- Admin controls for platform management
- Secure credential management via Supabase Secrets
