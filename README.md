Mini Project Manager

A full-stack project management web application built with React + TypeScript on the frontend and ASP.NET Core 8 + Entity Framework Core on the backend.

Live Demo
Frontend: https://project-manager-api-beryl.vercel.app

Backend API: Hosted on Render

Features
User Registration and Login with secure JWT authentication.

Create, view, and delete projects.

Add, update, delete, and toggle completion status of tasks within projects.

Filter and sort tasks by completion status, due date, and title.

Responsive design optimized for desktop and mobile devices.

Loading indicators (spinners) and clear user feedback messages during async operations.

Robust error handling with descriptive messages.

Clean and modern UI with smooth user experience.

Mobile-friendly and accessible layout.

Technologies Used
Frontend: React, TypeScript, React Router, Fetch API.

Backend: ASP.NET Core 8, Entity Framework Core, SQLite (in-memory for demo).

Authentication: JWT with BCrypt password hashing.

Deployment: Frontend deployed on Vercel, Backend deployed on Render.

Notes on Data Persistence
The backend currently uses SQLite in-memory storage or local file storage without persistent volumes.

Data will be reset or lost on backend redeploy or server restart.

For production use, consider configuring a persistent external database such as PostgreSQL.
