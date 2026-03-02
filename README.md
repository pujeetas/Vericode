# Vericode — AI-Powered Code Review Tool

> Paste your code. Get instant, structured AI feedback on bugs, performance, security, and more.

🔗 **Live Demo:** [vericode-ten.vercel.app](https://vericode-ten.vercel.app)

---

## What it does

Vericode uses Claude AI to review code in real time. Select a review type, paste your code, and get structured feedback streamed back word-by-word — no waiting for the full response.

Every review is saved with a unique UUID and can be shared via a permanent link.

---

## Features

- **AI-powered code review** — Powered by Claude (Anthropic), with structured output covering severity, issues, and suggestions
- **Auto language detection** — Automatically identifies the programming language before reviewing
- **5 review modes** — General Quality, Bug Detection, Performance, Security, Documentation
- **Real-time streaming** — Feedback streams token-by-token using Server-Sent Events (SSE)
- **Severity scoring** — Every review is classified as critical, moderate, or minor
- **Persistent storage** — Reviews saved to PostgreSQL with UUIDs for permanent access
- **Shareable links** — Every review gets a unique URL (e.g. `/review/abc123`)
- **Review history** — Browse all past reviews with language, type, and severity at a glance

---

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │  HTTPS  │                  │  API    │                 │
│  React Frontend │────────▶│  Express Backend │────────▶│   Claude API    │
│  (Vercel)       │◀────────│  (Render)        │         │  (Anthropic)    │
│                 │   SSE   │                  │         │                 │
└─────────────────┘         └────────┬─────────┘         └─────────────────┘
                                     │
                                     │ SQL
                                     ▼
                            ┌──────────────────┐
                            │                  │
                            │    PostgreSQL    │
                            │   (Supabase SG)  │
                            │                  │
                            └──────────────────┘
```

### How the review pipeline works

1. **Language detection** — First Claude call identifies the programming language (single word response, minimal tokens)
2. **Structured review** — Second Claude call with a language-aware prompt, streamed back via SSE
3. **Severity extraction** — Regex parses the severity level from the streamed response
4. **Persistence** — Full review saved to PostgreSQL with UUID on completion
5. **Response** — UUID returned to frontend, enabling shareable link generation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, React Router |
| Backend | Node.js, Express |
| AI | Claude API (Anthropic), streaming via SSE |
| Database | PostgreSQL (Supabase) |
| Deployment | Vercel (frontend), Render (backend) |
| State Management | React useState, custom streaming reader |

---

## Key Technical Decisions

**Why Server-Sent Events over WebSockets?**
SSE is unidirectional (server → client) which is exactly what streaming AI responses require. It's simpler to implement, works over HTTP/2, and doesn't require a persistent bidirectional connection.

**Why Render over Vercel for the backend?**
Vercel's serverless functions have execution time limits and don't support persistent streaming connections. Render runs a persistent Node.js process which is required for SSE streaming.

**Why two Claude API calls instead of one?**
Separating language detection (fast, ~10 tokens) from the full review (up to 1024 tokens) allows us to show the language badge immediately, improving perceived performance while the main review streams in.

```

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/pujeetas/vericode.git
cd vericode

# Backend setup
cd server
npm install
cp .env.example .env  # Add your API keys
node index.js

# Frontend setup (new terminal)
cd client
npm install
npm start
```

**Environment variables required:**
```
ANTHROPIC_API_KEY=your_claude_api_key
DATABASE_URL=your_postgresql_connection_string
PORT=5000
```

---

## Roadmap

- [ ] GitHub OAuth — connect repo and review files directly
- [ ] Multi-file review — understand relationships between files
- [ ] Diff view — highlight specific problematic lines
- [ ] Export review as PDF

---

## Author

**Pujeeta Singh** — Full-Stack Engineer, Singapore

[Portfolio](https://pujeeta-portfolio.vercel.app) · [LinkedIn](https://linkedin.com/in/pujeetasingh) · [GitHub](https://github.com/pujeetas)
