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
- 📐 **3×2 Horizontal Layout** – Standard “credit-card” flow (85.6×54 mm / 243×153 pt)  
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



