# Team Task Manager

A MERN full-stack assignment app for managing projects, team members, tasks, status tracking, and Admin/Member access.

## Tech Stack

- React + Vite frontend
- Node.js + Express backend
- MongoDB + Mongoose database
- JWT authentication

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Configure environment files:

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

3. Update `server/.env` with your MongoDB connection string and JWT secret.

4. Run both apps:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Roles

- Admin: manage projects, project members, and tasks.
- Member: view project/task access and update status for assigned tasks.

## Railway Deployment

This project is configured for a single Railway service. Railway builds the React client and the Express server serves the built frontend plus the `/api` routes.

### Required Environment Variables

Add these variables in Railway:

```env
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-long-random-secret
NODE_ENV=production
```

`PORT` is provided automatically by Railway.

### Railway Settings

- Build command: `npm run build`
- Start command: `npm start`

### Deploy Steps

1. Push this project to GitHub.
2. Open Railway and create a new project.
3. Select **Deploy from GitHub repo**.
4. Choose this repository.
5. Add the environment variables above.
6. Deploy and open the generated Railway domain.

### Submission

- Live URL: Add your Railway URL here after deployment.
- GitHub repo: https://github.com/missaarohi/Team-Task-Manager
