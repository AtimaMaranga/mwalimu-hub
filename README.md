# Mwalimu Wangu — Swahili Tutoring Platform

> **Mwalimu Wangu** means *"My Teacher"* in Swahili.
> Your gateway to Swahili fluency — connecting learners worldwide with qualified native Swahili teachers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, TypeScript) |
| **Styling** | Tailwind CSS v4 |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Auth** | Supabase Auth (admin dashboard) |
| **Email** | Resend |
| **Hosting** | Vercel (free tier) |
| **Forms** | React Hook Form + Zod validation |
| **Icons** | Lucide React |

---

## Features

### Public Pages
| Route | Description |
|---|---|
| `/` | Landing page with hero, steps, featured teachers, testimonials, blog preview |
| `/teachers` | Filterable/searchable teacher directory with pagination |
| `/teachers/[slug]` | Full teacher profile with contact modal |
| `/blog` | Blog listing with featured post |
| `/blog/[slug]` | Full blog post with social share and related posts |
| `/contact` | Contact form with email notifications |
| `/become-a-teacher` | Teacher application form |
| `/about` | About page with mission and values |
| `/how-it-works` | Step-by-step guide for students and teachers |
| `/faq` | Accordion FAQ |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy (GDPR-friendly) |

### Admin Dashboard (`/admin`)
- Protected with Supabase Auth
- Dashboard overview (stats for teachers, posts, submissions)
- Manage teachers (list, add, publish/unpublish)
- Manage blog posts (list, write, publish/unpublish)
- View contact form submissions and teacher applications

### API Routes
| Route | Method | Purpose |
|---|---|---|
| `/api/contact` | POST | Save contact form + send email notifications |
| `/api/apply` | POST | Save teacher application + send notifications |
| `/api/inquiry` | POST | Save student inquiry + send notifications |
| `/api/admin/logout` | POST | Sign out admin user |

---

## Quick Start (Local Development)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd mwalimu-hub
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In the Supabase dashboard, go to **SQL Editor**
3. Run the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the contents of `supabase/migrations/002_seed_data.sql` (adds 5 teachers + 3 posts)
5. Go to **Settings → API** and copy your project URL and keys

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_xxxxxxxxxxxx
ADMIN_EMAIL=you@yourdomain.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Set up Resend (email)

1. Sign up at [resend.com](https://resend.com) (free: 3,000 emails/month)
2. Create an API key → add it as `RESEND_API_KEY`
3. For production: verify your sending domain in Resend, then update the `FROM` address in `src/lib/email.ts`

### 5. Create your admin account

1. In Supabase → **Authentication → Users**
2. Click **Add user** (or **Invite user**)
3. Enter your admin email and set a password
4. Use those credentials at `/admin/login`

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

### Option A — Vercel Dashboard (recommended)

1. Push your code to a GitHub repository
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables under **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
   - `NEXT_PUBLIC_SITE_URL` (your production domain)
4. Click **Deploy**

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel
# Then set env vars:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY
vercel env add ADMIN_EMAIL
vercel env add NEXT_PUBLIC_SITE_URL
vercel --prod
```

### Custom domain

1. Vercel → **Settings → Domains → Add Domain**
2. Update `NEXT_PUBLIC_SITE_URL` to your live domain
3. Supabase → **Authentication → URL Configuration** → add your domain to allowed redirect URLs

---

## How to Add Teachers

### Via Admin Dashboard (recommended)
1. Log in at `/admin/login`
2. Go to **Teachers → Add Teacher**
3. Fill in all details and toggle **Publish immediately**

### Via Supabase SQL Editor
```sql
INSERT INTO teachers (
  slug, name, email, tagline, bio,
  specializations, hourly_rate,
  is_native_speaker, is_published, rating, total_students
) VALUES (
  'teacher-slug',
  'Teacher Name',
  'teacher@email.com',
  'Short tagline here',
  'Full biography text...',
  ARRAY['Conversational', 'Business'],
  30,
  TRUE, TRUE, 4.8, 0
);
```

---

## How to Write Blog Posts

### Via Admin Dashboard
1. Log in at `/admin/login`
2. Go to **Blog Posts → New Post**
3. Write content using Markdown:
   - `## Heading` for section headings
   - `**bold**` for bold text
   - `*italic*` for italics
   - `---` for horizontal dividers
4. Tick **Publish immediately** or save as draft

### Via Supabase SQL Editor
```sql
INSERT INTO blog_posts (
  slug, title, excerpt, content, author,
  category, tags, read_time, is_published, published_at
) VALUES (
  'my-post-slug',
  'Post Title',
  'Short excerpt...',
  '## Introduction\n\nYour content here...',
  'Author Name',
  'Beginner Tips',
  ARRAY['beginner', 'swahili'],
  5, TRUE, NOW()
);
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout (fonts, metadata)
│   ├── globals.css                 # Global styles + Tailwind theme
│   ├── not-found.tsx               # Custom 404 page
│   ├── sitemap.ts                  # Auto-generated XML sitemap
│   ├── robots.ts                   # robots.txt
│   ├── teachers/
│   │   ├── page.tsx                # Directory (server component)
│   │   ├── TeachersClient.tsx      # Filter/search/sort (client)
│   │   └── [slug]/
│   │       ├── page.tsx            # Teacher profile
│   │       └── TeacherContactModal.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── contact/
│   │   ├── page.tsx
│   │   └── ContactForm.tsx
│   ├── become-a-teacher/
│   │   ├── page.tsx
│   │   └── BecomeTeacherForm.tsx
│   ├── about/page.tsx
│   ├── how-it-works/page.tsx
│   ├── faq/page.tsx
│   ├── terms/page.tsx
│   ├── privacy/page.tsx
│   ├── admin/
│   │   ├── layout.tsx              # Auth guard + sidebar nav
│   │   ├── page.tsx                # Dashboard overview
│   │   ├── login/page.tsx
│   │   ├── teachers/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   └── submissions/page.tsx
│   └── api/
│       ├── contact/route.ts
│       ├── apply/route.ts
│       ├── inquiry/route.ts
│       └── admin/logout/route.ts
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx              # Sticky responsive nav
│   │   ├── Footer.tsx
│   │   └── PageWrapper.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── StarRating.tsx
│   │   ├── Toast.tsx
│   │   └── Skeleton.tsx
│   └── sections/
│       ├── TeacherCard.tsx
│       └── BlogCard.tsx
├── lib/
│   ├── utils.ts                    # Utility helpers
│   ├── email.ts                    # Resend email templates
│   └── supabase/
│       ├── client.ts               # Browser client
│       ├── server.ts               # Server + admin clients
│       └── queries.ts              # Data fetching helpers
└── types/
    └── index.ts                    # TypeScript interfaces
supabase/
└── migrations/
    ├── 001_initial_schema.sql      # Tables, indexes, RLS policies
    └── 002_seed_data.sql           # Sample teachers and blog posts
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server only, bypasses RLS) |
| `RESEND_API_KEY` | ✅ | Resend API key for sending emails |
| `ADMIN_EMAIL` | ✅ | Where admin notifications are sent |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Full domain, no trailing slash |

---

## Troubleshooting

**Teachers not showing**
- Confirm `is_published = TRUE` in the `teachers` table
- Check Supabase env vars are set correctly
- Ensure the schema migration was run

**Emails not sending**
- Verify `RESEND_API_KEY` is correct
- On Resend's free plan, you can only send to verified addresses in development
- Check the Resend dashboard logs for bounces or errors

**Admin login loops back to login**
- Ensure you created a user in Supabase Auth → Users
- Clear browser cookies and try again
- Make sure `NEXT_PUBLIC_SUPABASE_URL` and anon key are correct

**Images not loading from Unsplash**
- Unsplash is already whitelisted in `next.config.ts`
- For other image domains, add them under `images.remotePatterns`

**Build errors**
```bash
npm run build 2>&1 | head -80
```

---

## Deployment Checklist

- [ ] Database schema migration run in Supabase SQL Editor
- [ ] Seed data migration run (or real teachers added)
- [ ] Admin user created in Supabase Auth
- [ ] All environment variables set in Vercel
- [ ] Custom domain configured in Vercel
- [ ] Domain added to Supabase Auth allowed URLs
- [ ] Resend domain verified (for production emails)
- [ ] Contact forms tested end-to-end
- [ ] Admin login verified
- [ ] Mobile layout checked on real device
- [ ] Sitemap submitted to Google Search Console

---

## Phase 2 Roadmap (Future Enhancements)

- **Payments** — Stripe / M-Pesa integration with commission model
- **Student accounts** — registration, lesson history, teacher bookmarking
- **In-platform messaging** — real-time chat between students and teachers
- **Calendar booking** — Calendly / Cal.com integration
- **Verified reviews** — post-lesson student reviews with ratings
- **Email newsletter** — Resend broadcast campaigns
- **Teacher dashboard** — teachers manage their own profiles
- **Multi-language UI** — French, Arabic
- **Advanced analytics** — Vercel Analytics / Plausible

---

*Mwalimu Wangu — Built with ❤️ for Swahili learners worldwide.*
