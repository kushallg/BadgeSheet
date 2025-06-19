# 🎫 BadgeSheet – Instant A4 Badge Inserts

> **Overview:**  
> BadgeSheet is a lean, web-only micro-SaaS that turns a simple list of names into print-ready, credit-card-sized name badges in seconds. Built with React/TSX on the front end and a single Supabase Edge Function (using pdf-lib) on the back end, BadgeSheet lets you:
> 1. Paste or upload a newline-separated guest list  
> 2. Click **Download PDF**  
> 3. Print on A4, cut, and slide into your plastic badge holders  
>  
> No label sheets. No glue. Zero fuss.

---

## 🚀 Features

- 🧡 **Bold Orange Default** – Solid primary-orange badges with black text  
- 📐 **3×2 Horizontal Layout** – Standard "credit-card" flow (85.6×54 mm / 243×153 pt)  
- 🔄 **Multi-Page Support** – Auto-paginate if you exceed six badges  
- 🔒 **CORS + JSON API** – Base64-encoded PDF response for secure download  
- 🌐 **Serverless** – Single Supabase Edge Function, zero servers to manage  
- ⚡️ **Fast** – Generates a 6-badge PDF in under a second  

---

## 📸 Preview

1. Paste or upload names  
2. Click **Download PDF**  
3. Print, cut, and stick  

---

## 💻 Tech Stack

| Layer               | Technology                         |
| ------------------- | ---------------------------------- |
| ✨ Frontend          | React + TypeScript + Tailwind CSS  |
| 🚀 Hosting          | Vercel (frontend)                  |
| 🔧 Backend          | Supabase Edge Functions (Deno)     |
| 📦 PDF Generation   | [pdf-lib](https://pdf-lib.js.org/) |
| 🔐 Auth & Storage   | Supabase Auth & Storage            |
| 💳 Billing (future) | Stripe via Supabase Billing        |

---

## 🚀 Key Features

- **Instant PDF Generation:** Create A4 PDFs with multiple badges per page.
- **Simple UI:** Easy-to-use interface for uploading names and selecting templates.
- **Stripe Integration:** Supports both one-time purchases and monthly subscriptions.
- **Secure Auth:** User management handled by Supabase Auth.
- **Customizable Templates:** Color options to match event branding.

---

## 🚀 Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/badge-blitz-inserts.git
cd badge-blitz-inserts
```

### 2. Install dependencies

```bash
bun install
```

### 3. Set up Supabase

1.  Create a new project on [Supabase](https://supabase.com/).
2.  In the SQL Editor, run the schema from `supabase/schema.sql` to create the necessary tables.
3.  Go to Project Settings > API and find your Project URL and `anon` public key.

### 4. Set up Environment Variables

Create a `.env` file in the root of the project and add the following variables. See the `.env.example` section below for a template.

### `.env.example`

```
# Supabase Project Details
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY" # Found in Project Settings > API

# Stripe API Keys
VITE_STRIPE_PUBLISHABLE_KEY="YOUR_STRIPE_PUBLISHABLE_KEY"
STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET_KEY"
STRIPE_PRICE_ID_ONE_TIME="YOUR_STRIPE_ONE_TIME_PRICE_ID"
STRIPE_PRICE_ID_SUBSCRIPTION="YOUR_STRIPE_SUBSCRIPTION_PRICE_ID"

# The URL of your deployed application
# For local development, this is usually http://localhost:5173
SITE_URL="http://localhost:5173"
```

### 5. Deploy Supabase Functions

Deploy the edge functions using the Supabase CLI:

```bash
supabase functions deploy --project-ref YOUR_PROJECT_REF
```

### 6. Run the application

```bash
bun run dev
```

The application should now be running on `http://localhost:5173`.



