# WriteThink AI Platform

An AI-powered writing coach that helps students develop stronger arguments through guided thinking rather than providing answers.

**Designed by [Lemiscatemind.com](https://lemiscatemind.com)**

## Features

- **Guided Thinking**: AI coach asks questions to help develop ideas
- **Structured Development**: Breaks down argument building into phases
- **Interactive Chat**: Real-time conversation with AI writing coach
- **Note Taking**: Capture thoughts and ideas as you work
- **Word Export**: Download your complete thinking process as a Word document
- **Responsive Design**: Works seamlessly on desktop and mobile

## Quick Start

1. **Start the development server:**
   ```bash
   ./start.sh
   ```

2. **Add your Claude API key:**
   - Get your key from [Anthropic Console](https://console.anthropic.com/)
   - Edit `.env.local`:
     ```
     CLAUDE_API_KEY=your_actual_api_key_here
     ```

3. **Open the app:**
   - Navigate to http://localhost:3000
   - Enter a topic and initial thesis to begin

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions to Cloudflare Pages.

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js runtime
- **AI**: Claude 3 Haiku via Anthropic API
- **Icons**: Lucide React
- **Deployment**: Cloudflare Pages

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

**Designed by [Lemiscatemind.com](https://lemiscatemind.com)**  
*Educational technology for critical thinking and writing development*
# WriteThink AI - Static Version
