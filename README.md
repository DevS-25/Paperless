# Paperless - Digital Document Management System

## Project Structure
- `frontend/`: React.js frontend
- `src/`: Spring Boot backend
- `Dockerfile`: Docker configuration for backend deployment

## Deployment Guide

### 1. Backend Deployment (Render)

1.  Create a new **Web Service** on [Render](https://render.com/).
2.  Connect your GitHub repository.
3.  Select the root directory as the base.
4.  **Runtime:** Docker
5.  **Environment Variables:**
    Add the following environment variables in Render dashboard:
    *   `DB_URL`: Your MySQL database URL (e.g., from Render MySQL, Railway, or Aiven).
        *   Format: `jdbc:mysql://<host>:<port>/<database_name>`
    *   `DB_USERNAME`: Database username
    *   `DB_PASSWORD`: Database password
    *   `JWT_SECRET`: A long random string for security
    *   `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
    *   `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
    *   `CORS_ALLOWED_ORIGINS`: The URL of your deployed frontend (e.g., `https://paperless-frontend.vercel.app`)
    *   `FILE_UPLOAD_DIR`: `/tmp/uploads` (Render has ephemeral filesystem, use `/tmp` or attach a persistent disk)

### 2. Frontend Deployment (Vercel)

1.  Create a new project on [Vercel](https://vercel.com/).
2.  Import your GitHub repository.
3.  **Root Directory:** Select `frontend`.
4.  **Build Command:** `npm run build` (Default)
5.  **Output Directory:** `build` (Default)
6.  **Environment Variables:**
    *   `REACT_APP_API_URL`: The URL of your deployed backend on Render (e.g., `https://paperless-backend.onrender.com/api`)
    *   `REACT_APP_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID

### 3. Database Setup

You need a MySQL database. You can use:
*   **Render:** Create a managed MySQL database.
*   **Railway:** Create a MySQL service.
*   **Aiven:** Create a free MySQL service.

Once created, use the connection details to populate the `DB_...` environment variables in Render.

### 4. Google OAuth Setup

1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Navigate to APIs & Services > Credentials.
3.  Edit your OAuth 2.0 Client ID.
4.  **Authorized JavaScript origins:** Add your Vercel frontend URL.
5.  **Authorized redirect URIs:** Add your Vercel frontend URL (and potentially backend URL if doing server-side flow, but this app uses client-side flow mostly).

## Local Development

### Backend
1.  Update `src/main/resources/application.properties` if needed (defaults are set for localhost).
2.  Run `mvn spring-boot:run` or use `start-backend.bat`.

### Frontend
1.  `cd frontend`
2.  `npm install`
3.  `npm start` or use `start-frontend.bat`.

