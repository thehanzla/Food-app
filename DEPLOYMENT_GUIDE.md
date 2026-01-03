# Vercel Deployment Guide

This project is configured for deployment on Vercel as a monorepo.

## 1. Environment Variables
You must set the following Environment Variables in your Vercel Project Settings:

- **VITE_API_URL**: The URL of your deployed backend API.
  - Example: `https://your-project-name.vercel.app/api`
  - *Note*: If frontend and backend are on the same domain, `/api` might work, but absolute URL is safer.

- **CLIENT_URL**: The URL of your frontend.
  - Example: `https://your-project-name.vercel.app`

- **BASE_URL**: The URL of your backend (usually the same as project URL).
  - Example: `https://your-project-name.vercel.app`

- **MONGODB_URI**: Your production MongoDB connection string (Atlas).

- **JWT_SECRET**: Your secret key for tokens.

## 2. Important Notes

### Uploads
⚠️ **Warning**: Vercel is a Serverless platform. The filesystem is **ephemeral** (temporary).
- Images uploaded to `uploads/` will **NOT** persist after a redeployment.
- For production apps, you should rewrite the image upload logic to use a service like **Cloudinary**, **AWS S3**, or **UploadThing**.
- The current setup directs `/uploads` to the backend, but images may disappear or result in broken links.

### Deployment Steps
1. Push this code to GitHub.
2. Go to Vercel Dashboard -> Add New Project -> Import from GitHub.
3. Select this repository.
4. **Build Settings**: Vercel usually auto-detects `vite` for frontend.
   - Framework Preset: Vite
   - Root Directory: `./` (or `frontend` if you want to deploy separately, but this config assumes monorepo root)
   - *However*, with `vercel.json` at root, Vercel picks it up automatically.
5. Add the Environment Variables listed above.
6. Deploy!
