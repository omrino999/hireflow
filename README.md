# HireFlow 🚀

**An AI-powered job application tracker.** Manage your whole job search in one place — track applications through a status pipeline, and let AI help at every stage: analyze your fit for each role, tailor your CV per job, and prep for interviews.

Built as a Full Stack + Python final project (John Bryce, 2026).

<!-- Add once deployed: **Live demo:** https://... -->

---

## ✨ Features

- **Application pipeline** — track jobs through Saved → Applied → Interview → Offer → Rejected, with dates, notes, salary, location, and favorites
- **AI CV tools** — generate a CV from a description, get improvement tips, and tailor your CV to each job. Reads even **image-based / designed PDFs** via Claude vision (falls back from text parsing)
- **AI fit analysis** — score how well your CV matches a role, with strengths & gaps
- **AI interview prep** — role-specific questions with suggested answers
- **Career paths** — AI-suggested roles that fit your profile, plus skills to grow
- **Dashboard** — stats, charts (Recharts), starred jobs, upcoming interviews, and an interactive **job map** (Leaflet + OpenStreetMap) with your location pinned for proximity
- **Dark / light mode**, responsive, CV export to PDF / Word

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS v4, Recharts, Leaflet, jsPDF |
| Backend | Node.js, Express, PostgreSQL, Sequelize ORM |
| AI | Claude (Anthropic API) — structured outputs, vision, prompt caching |
| Auth & Security | JWT, bcrypt, rate limiting, owner-scoped queries, input validation |
| Tooling | Docker (Postgres), Morgan logging, PDF/DOCX parsing |

---

## 🏗️ Architecture

```
client/  → React SPA (Vite)  ──REST──►  server/  → Express API  ──►  PostgreSQL
                                             │
                                             └──►  Claude (Anthropic API)
```

- Frontend and backend are separate apps. In dev, Vite proxies `/api` → the backend.
- All user data is owner-scoped (users can only access their own jobs/profile).
- AI results are persisted so they aren't recomputed; the API key lives only on the server.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker (for the PostgreSQL database)
- An [Anthropic API key](https://console.anthropic.com)

### 1. Clone & install
```bash
git clone https://github.com/omrino999/hireflow.git
cd hireflow
cd server && npm install
cd ../client && npm install
```

### 2. Start the database (Docker)
```bash
# from the project root
docker compose up -d
```

### 3. Configure the backend
```bash
cd server
cp .env.example .env
# edit .env — set JWT_SECRET and ANTHROPIC_API_KEY
```

### 4. Run
```bash
# terminal 1 — backend (http://localhost:5000)
cd server && npm run dev

# terminal 2 — frontend (http://localhost:5173)
cd client && npm run dev
```

Open **http://localhost:5173**.

---

## 🔐 Security Notes

- The Anthropic API key is **only** used server-side — never exposed to the client or committed (`.env` is gitignored).
- AI endpoints are auth-gated and rate-limited to bound cost.
- Set a spending cap on your Anthropic account for extra safety.

---

## 🗺️ Roadmap

- CV version library (multiple named CVs)
- Best-effort job import from a URL
- Follow-up email reminders
- Streaming AI responses
- Email verification / OAuth login

---

Built by **Omri Shitrit** — [GitHub](https://github.com/omrino999)
