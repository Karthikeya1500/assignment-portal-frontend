# Assignment Portal — Frontend

Single‑page application for the Assignment Workflow Portal. Built with **React.js** and styled with **Tailwind CSS**.

## Features

- Single login screen with role-based redirection (teacher / student)
- **Context API** for global auth state management
- Teacher dashboard with analytics cards, assignment CRUD, status tabs, and submission viewer
- Student dashboard with assignment list, submission modal (text + file), and view-only mode
- Client-side form validation
- Due-date highlighting (past-due badges)
- Responsive, clean UI with Tailwind CSS

## Tech Stack

| Layer        | Technology      |
|--------------|-----------------|
| Framework    | React 19 (Vite) |
| Routing      | React Router v7 |
| State Mgmt   | Context API     |
| HTTP Client  | Axios           |
| Styling      | Tailwind CSS v4 |
| Fonts        | Google Fonts (Lexend) |

## Prerequisites

- Node.js v18+  
- npm  
- Backend API running at `http://localhost:5001`

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app runs on `http://localhost:5173` by default.

## Project Structure

```
├── public/                   # Static files
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Register page
│   │   ├── StudentDashboard.jsx # Student view
│   │   └── TeacherDashboard.jsx # Teacher view
│   ├── context/
│   │   └── AuthContext.jsx    # Auth state (Context API)
│   ├── App.jsx                # Routes + auth guards
│   ├── main.jsx               # App entry point
│   └── index.css              # Tailwind + theme config
├── index.html
├── vite.config.js
└── package.json
```

## User Flows

### Login
1. User enters email and password on the login page.
2. Backend returns a JWT token and the user's role.
3. Frontend stores the token in Context (backed by localStorage).
4. User is redirected to their role-specific dashboard.

### Teacher Flow
1. Teacher creates a new assignment → saved as **Draft**.
2. Teacher publishes the assignment → status becomes **Published**.
3. Students submit answers.
4. Teacher reviews submissions and optionally marks them as **Reviewed**.
5. Teacher marks the assignment as **Completed** when done.

### Student Flow
1. Student logs in and sees only **Published** assignments.
2. Student submits an answer (text and/or file upload).
3. After submission, the answer is locked and can be viewed but not edited.
4. Past-due assignments show a red "Past Due" badge and block submissions.

## Notes

- The frontend expects the backend to be running on `http://localhost:5001`.
- Authentication state is managed centrally via React Context API.
- All form inputs are validated on the client before sending to the backend.
