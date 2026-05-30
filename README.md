# Girish M — Portfolio

A production-grade personal portfolio with a built-in CMS. Light-themed, fast, and fully editable from your browser.

**Tech stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Firebase · Vercel

---

## 🚀 Setup in 15 Minutes

### 1. Clone & Install
```bash
git clone <your-repo>
cd portfolio
npm install
```

### 2. Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g. `girish-portfolio`)
3. Enable **Authentication** → Sign-in method → **Google**
4. Create **Firestore Database** → Start in production mode
5. Create **Storage** bucket
6. Go to Project Settings → Add Web App → copy config values

### 3. Set Firebase Security Rules

**Firestore rules** (Firebase Console → Firestore → Rules):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for published content
    match /blogs/{doc} {
      allow read: if resource.data.status == 'published' || request.auth != null;
      allow write: if request.auth != null;
    }
    match /projects/{doc} { allow read: if true; allow write: if request.auth != null; }
    match /experiments/{doc} { allow read: if true; allow write: if request.auth != null; }
    match /timeline/{doc} { allow read: if true; allow write: if request.auth != null; }
    match /resume/{doc} { allow read: if true; allow write: if request.auth != null; }
    match /config/{doc} { allow read: if true; allow write: if request.auth != null; }
  }
}
```

**Storage rules** (Firebase Console → Storage → Rules):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Configure Environment
```bash
cp .env.local.example .env.local
# Fill in your Firebase values + your Google email as admin
```

### 5. Seed Initial Data (optional)
Open browser console on your local dev server after signing in as admin, then run snippets from `src/lib/seed.ts` to pre-populate content.

### 6. Run Locally
```bash
npm run dev
# → http://localhost:3000        (public portfolio)
# → http://localhost:3000/admin  (CMS — Google auth required)
```

---

## 📝 Content Management

Navigate to `/admin` and sign in with your Google account.

| Section | Where |
|---------|-------|
| Write a blog post | Admin → Blog Posts → New Post |
| Add/edit projects | Admin → Projects → Add Project |
| Upload demo video | Admin → Projects → Edit → Demo section |
| Update resume | Admin → Resume → drag & drop PDF |
| Manage experiments | Admin → Experiments |

### Blog Editor Features
- **Rich text mode** — Notion-like WYSIWYG (Tiptap)
- **Markdown mode** — raw markdown with live preview
- Cover image upload → Firebase Storage
- Draft / Published status toggle
- Auto-generated slugs, reading time, SEO metadata

### Project Page Features
- Short description (shown in card)
- Long description / case study (rich text)
- Demo options: upload MP4 video, YouTube embed, iframe, or image gallery
- Tech stack chips, metrics, GitHub/live links
- Architecture diagram image

---

## 🌐 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Then add your environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

**Add all `NEXT_PUBLIC_FIREBASE_*` variables + `NEXT_PUBLIC_ADMIN_EMAILS`.**

Vercel will auto-deploy on every `git push`.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              ← Main portfolio (server component, ISR)
│   ├── blog/
│   │   ├── page.tsx          ← Blog list
│   │   └── [slug]/page.tsx   ← Blog post
│   ├── projects/
│   │   └── [slug]/page.tsx   ← Project detail with demo
│   └── admin/                ← CMS (auth-gated)
│       ├── layout.tsx        ← Auth guard + sidebar
│       ├── page.tsx          ← Dashboard
│       ├── blogs/            ← Blog CRUD + Tiptap editor
│       ├── projects/         ← Project CRUD + media upload
│       ├── experiments/      ← Experiments CRUD
│       └── resume/           ← PDF upload + version history
├── components/
│   ├── sections/             ← Hero, Projects, Skills, Timeline, etc.
│   ├── admin/                ← RichEditor (Tiptap + Markdown toggle)
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ProjectDemo.tsx       ← Video/image gallery renderer
├── lib/
│   ├── firebase.ts           ← Firebase init + collection names
│   ├── db.ts                 ← All Firestore CRUD operations
│   ├── storage.ts            ← Firebase Storage upload helpers
│   ├── auth-context.tsx      ← Google Auth context + useAuth hook
│   ├── utils.ts              ← cn(), formatDate(), color maps
│   └── seed.ts               ← Sample data for initial setup
└── types/
    └── index.ts              ← All TypeScript interfaces
```

---

## 🎨 Customization

### Change your info
Edit `src/lib/seed.ts` → `SEED_CONFIG` with your real name, email, GitHub, LinkedIn. Then save it to Firestore via the Firebase Console or the seed script.

### Change colors
Edit `tailwind.config.ts` → `theme.extend.colors.brand` to change the primary color.

### Add a new section
1. Create `src/components/sections/YourSection.tsx`
2. Import and add it to `src/app/page.tsx`
3. Add Firestore collection to `COLLECTIONS` in `src/lib/firebase.ts`
4. Add CRUD functions to `src/lib/db.ts`
5. Add admin page to `src/app/admin/your-section/page.tsx`

---

## ⚡ Performance

- Server Components for all data fetching (zero client JS for static content)
- ISR (Incremental Static Regeneration) — pages revalidate every 60s
- Framer Motion lazy-loaded, canvas animations GPU-accelerated
- Firebase reads only happen server-side at build/revalidation time
- Images served via Firebase CDN

---

*Built with caffeine and Next.js 15. Deploy time: ~15 minutes.*
