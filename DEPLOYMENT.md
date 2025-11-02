# WriteThink AI - Deployment Guide

**Designed by [Lemiscatemind.com](https://lemiscatemind.com)**

## Quick Start (Local Development)

1. **Run the start script:**
   ```bash
   ./start.sh
   ```

2. **Add your Claude API Key:**
   - Get your API key from [Anthropic Console](https://console.anthropic.com/)
   - Edit `.env.local` file:
     ```
     CLAUDE_API_KEY=your_actual_api_key_here
     ```

3. **Access the app:**
   - Open http://localhost:3000 (or the port shown in terminal)

## Cloudflare Pages Deployment

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "WriteThink AI platform ready for deployment"
   git push origin main
   ```

2. **Connect to Cloudflare Pages:**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project"
   - Connect your GitHub repository
   - Select this repository

3. **Configure Build Settings:**
   - **Build command:** `npm run build`
   - **Output directory:** `.next`
   - **Node.js version:** 18.x or higher

4. **Set Environment Variables:**
   - Go to your Pages project → Settings → Environment Variables
   - Add: `CLAUDE_API_KEY` with your actual API key

5. **Deploy:**
   - Click "Save and Deploy"
   - Your app will be live in a few minutes

### Option 2: Wrangler CLI

1. **Install Wrangler:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Set Environment Variable:**
   ```bash
   wrangler pages secret put CLAUDE_API_KEY
   ```
   (Enter your API key when prompted)

4. **Deploy:**
   ```bash
   wrangler pages deploy .next
   ```

## Troubleshooting

### Common Issues

1. **"Claude API key not configured" error:**
   - Make sure `CLAUDE_API_KEY` is set in your environment variables
   - Verify the key starts with `sk-` and is valid

2. **Build errors:**
   - Ensure all dependencies are installed: `npm install`
   - Check Node.js version: `node --version` (should be 18.x+)

3. **API route not working:**
   - Verify the API route exists at `/api/claude`
   - Check browser network tab for error details

### Environment Variables

For local development (`.env.local`):
```
CLAUDE_API_KEY=your_api_key_here
```

For Cloudflare Pages:
- Set in the Cloudflare Pages dashboard under Environment Variables
- Or use `wrangler pages secret put CLAUDE_API_KEY`

## Features Deployed

✅ **Frontend:** Complete React TypeScript application with Tailwind styling  
✅ **Backend:** Secure Claude API route with error handling  
✅ **API Integration:** Chat functionality and writing development features  
✅ **Word Export:** Download thinking process as editable Word document  
✅ **Responsive Design:** Works on desktop and mobile  

## Next Steps

After deployment, you can:
- Test all functionality with a real Claude API key
- Customize the UI/styling as needed
- Add authentication if desired
- Implement additional writing phases
- Set up custom domain in Cloudflare Pages

## Support

If you encounter issues:
1. Check the deployment logs in Cloudflare Pages dashboard
2. Verify API key is correctly set
3. Test locally first with `./start.sh`

---

**WriteThink AI Platform - Designed by [Lemiscatemind.com](https://lemiscatemind.com)**