# G99 WebAudit

G99 WebAudit is an elite, multi-agent AI auditing engine that comprehensively analyzes websites across 11 critical vectors including SEO, Accessibility, UX, Visual Design, Performance, Security, and more. 

It generates deep, deterministic checks and utilizes multiple instances of Google's Gemini Flash model to synthesize intelligent remediation strategies, exporting them into beautiful, agency-grade PDF reports.

## Features
- **11 Specialized AI Agents**: Concurrent analysis across multiple domains.
- **Deep Technical Crawling**: Uses Cheerio and Playwright to extract DOM, Lighthouse scores, and take high-resolution full-page screenshots.
- **Comprehensive Dashboards**: View historical scans, average scores, and API usage quotas.
- **Multi-Page Auditing**: Add unlimited sub-pages to an existing audit to expand the report.
- **PDF Export**: Generate high-fidelity, paginated PDF reports for clients.

---

## 🛠 Local Setup & Development

### 1. Prerequisites
- **Node.js** (v18+)
- **npm** or **pnpm**
- A **Groq API Key** (for fast fallback inference)
- A **Gemini API Key** (for primary agent synthesis)
- A **Clerk Account** (for authentication)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/sameerhassan-beep/g99-web-audit.git
cd g99-web-audit
npm install
```

Install Playwright browsers (required for screenshot agents):
```bash
npx playwright install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
GROQ_API_KEY=your_groq_api_key
GEMINI_KEYS=your_comma_separated_gemini_keys

# For Supabase Integration (Optional for local, required for live)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🚀 Going Live (Supabase Database Migration)

Currently, the app relies on the browser's `localStorage` to save reports for fast local development. To deploy this app live (e.g., on Vercel), you must connect a real database so audits persist across different devices. 

We have provided a complete migration file to set up a Supabase backend seamlessly.

### Step 1: Run the Database Migration
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Navigate to the **SQL Editor** in the left sidebar.
3. Open the file `supabase/migrations/00000000000000_init.sql` from this repository.
4. Copy its contents and paste it into the Supabase SQL Editor.
5. Click **Run**. This will create the `audits` table and configure the `screenshots` storage bucket with the correct Row Level Security (RLS) policies.

### Step 2: Migrate Your Existing Local Data (Optional)
If you have existing audits saved in your local browser that you want to push to the live database, follow these steps:
1. Open your local app in the browser (`http://localhost:3000/dashboard`).
2. Open the browser's **Developer Tools** (Right Click -> Inspect -> Console).
3. Open the file `scripts/export_to_sql.js` from this repository, copy all the code, and paste it into the Console. Press Enter.
4. It will instantly download a file named `seed_current_data.sql`.
5. Open this new file, copy its contents, and run it in the Supabase SQL Editor. All your past audits will instantly appear in the live database!

### Step 3: Update Code to Use Supabase (Next Steps)
You will need to replace the `localStorage.getItem` and `localStorage.setItem` calls in `src/app/dashboard/page.tsx` and `src/app/dashboard/report/page.tsx` with Supabase client calls (`supabase.from('audits').select('*')`). Ensure you use the provided environment variables.
