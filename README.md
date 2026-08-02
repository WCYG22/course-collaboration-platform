<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Course Collaboration Platform

An AI-powered course collaboration platform built with React, TypeScript, and Vite, featuring real-time discussions, scheduling, and milestone tracking.

View your app in AI Studio: https://ai.studio/apps/92a3a2e4-144b-4dd8-bcc2-e80d543d107d

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deploy to Render

### Option 1: Using Render Dashboard (Recommended)

1. Push this repository to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" and select "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name:** course-collaboration-platform
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run preview`
   - **Environment Variables:** Add `GEMINI_API_KEY` with your API key
6. Click "Create Web Service"

### Option 2: Using render.yaml (Infrastructure as Code)

1. Push this repository to GitHub (including the `render.yaml` file)
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" and select "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` and configure your service
6. Add the `GEMINI_API_KEY` environment variable when prompted

## GitHub Setup

If you haven't pushed to GitHub yet:

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Technologies Used

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI
- Recharts
- Lucide React Icons
