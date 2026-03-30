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

## Portal Overview

This is a **customer-facing portal** built on top of LiteLLM proxy, providing:

### 🔑 API Key Management
- Users can create and manage their own API keys
- Each key is a LiteLLM virtual key with configurable spend limits
- Real-time usage tracking per key
- Easy integration guide with OpenAI SDK and Claude Code

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

## Summary

This portal transforms LiteLLM proxy into a **full-featured SaaS product** with:
- Self-service user onboarding (Supabase Auth)
- API key self-management
- Built-in chat interface for model testing
- Credit-based billing system
- Admin controls for platform management
