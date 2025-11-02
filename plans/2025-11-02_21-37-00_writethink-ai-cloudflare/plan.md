# Spec Provenance
**User Request**: Deploy existing Claude API React app to Cloudflare with secure backend API route  
**Discovery**: User has working React JSX file using Claude API, wants to keep frontend unchanged, just add secure backend  
**Approach**: Convert to Next.js fullstack app with API routes for Claude calls

# Spec Header

**Name**: WriteThink AI Platform - Cloudflare Deployment  
**Smallest Scope**: Convert single JSX file to Next.js app with secure Claude API backend route, deploy to Cloudflare  
**Non-Goals**: Changing existing UI/UX, adding auth, database, or new features - just secure deployment

# Paths to Supplementary Guidelines

- Full Next.js Stack: https://raw.githubusercontent.com/memextech/templates/refs/heads/main/stack/nextjs_fullstack.md

# Decision Snapshot

**Tech Stack**:
- Next.js App Router (for Cloudflare Pages compatibility)
- Existing React component (minimal changes)
- API route for Claude API calls (security)
- Cloudflare Pages deployment
- Environment variables for API key

**Architecture Choice**: Next.js over pure React SPA because:
- Secure API routes protect Claude API key
- Cloudflare Pages has excellent Next.js support
- Minimal migration from existing JSX
- Production-ready with zero additional infrastructure

**Deployment**: Cloudflare Pages over Netlify because user specifically requested Cloudflare

# Architecture at a Glance

```
Frontend (React)          Backend (Next.js API)         External
┌─────────────────┐       ┌──────────────────┐        ┌─────────────┐
│ WriteThink      │────→  │ /api/claude      │────→   │ Claude API  │
│ Component       │       │ - POST endpoint  │        │             │
│ - Same UI       │       │ - API key secure │        └─────────────┘
│ - Fetch to API  │       │ - Error handling │
└─────────────────┘       └──────────────────┘

Cloudflare Pages
├── Frontend: Static React build
├── Backend: Edge/Node.js functions  
└── Environment: CLAUDE_API_KEY
```

# Implementation Plan

## Phase 1: Project Setup
1. **Initialize Next.js project**
   ```bash
   npx create-next-app@latest writethink-ai-platform --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   cd writethink-ai-platform
   ```

2. **Install Claude SDK**
   ```bash
   npm install @anthropic-ai/sdk
   ```

## Phase 2: Frontend Migration  
3. **Convert JSX to Next.js component**
   - Move existing JSX code to `src/components/WriteThinkAI.tsx`
   - Update import statements for Next.js
   - Replace API calls with fetch to `/api/claude`

4. **Create main page**
   - Set up `src/app/page.tsx` to render WriteThink component
   - Ensure Tailwind styles work correctly

## Phase 3: Backend API Route
5. **Create Claude API route** 
   - `src/app/api/claude/route.ts`
   - Handle POST requests securely  
   - Validate request data
   - Call Claude API with server-side key
   - Return structured responses

6. **Environment setup**
   - Create `.env.local` with `CLAUDE_API_KEY`
   - Add `.env.local` to `.gitignore`

## Phase 4: Frontend Updates
7. **Update API calls in component**
   - Replace direct Claude API calls with fetch to `/api/claude`
   - Handle loading states and errors
   - Maintain existing UI behavior

## Phase 5: Cloudflare Deployment
8. **Configure for Cloudflare Pages**
   - Create `next.config.js` for static export if needed
   - Set up `wrangler.toml` if using Functions
   - Configure build command and output directory

9. **Deploy to Cloudflare**
   - Connect GitHub repository to Cloudflare Pages
   - Set environment variable `CLAUDE_API_KEY`
   - Deploy and test

# Verification & Demo Script

## Local Testing
```bash
# Install dependencies
npm install

# Set environment variable
echo "CLAUDE_API_KEY=your_key_here" > .env.local

# Run development server
npm run dev

# Test application
# 1. Open http://localhost:3000
# 2. Enter a topic and thesis
# 3. Click "Start Developing Your Thinking" 
# 4. Verify Claude responses work
# 5. Test chat functionality
# 6. Confirm all original features work
```

## Production Testing
```bash
# Build for production
npm run build

# Test production build locally  
npm start

# Deploy to Cloudflare Pages
# 1. Connect repo to Cloudflare Pages
# 2. Set CLAUDE_API_KEY environment variable
# 3. Deploy and test live URL
# 4. Verify API routes work in production
```

## Success Criteria
- ✅ Original UI/UX completely preserved
- ✅ Claude API calls work securely through backend
- ✅ All original features functional (phases, chat, notes)
- ✅ Deployed successfully to Cloudflare Pages
- ✅ API key never exposed to client
- ✅ Loading states and error handling work

# Deploy

**Platform**: Cloudflare Pages  
**Build Command**: `npm run build`  
**Output Directory**: `.next` (or `out` if using static export)  
**Environment Variables**: `CLAUDE_API_KEY`  
**Runtime**: Node.js functions for API routes  

**Post-deployment**:
1. Verify live URL loads correctly
2. Test Claude API functionality 
3. Monitor function logs for any errors
4. Set up custom domain if desired