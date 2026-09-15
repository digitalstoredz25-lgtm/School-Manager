# School Manager

Backend scaffold for a school management system: authentication, roles (admin/teacher/student), and a **working password-reset-via-email flow**.

## What was fixed in the password reset flow

The typical cause of "reset password emails never arrive" is one or more of:

1. `transporter.sendMail(...)` called without `await`, so the HTTP response
   is sent before the email actually goes out — any SMTP error becomes an
   unhandled promise rejection that never reaches the client or the logs.
2. `SMTP_SECURE` not matching `SMTP_PORT` (port `465` requires `secure: true`;
   port `587` requires `secure: false` with STARTTLS).
3. Errors from the mail step being caught and silently ignored instead of
   surfaced.
4. No startup check, so a broken SMTP config isn't noticed until a real user
   hits "forgot password" in production.

This scaffold fixes all four: `utils/sendEmail.js` throws loudly on failure,
`routes/auth.js` awaits it and returns a real error to the client if sending
fails (rolling back the token so it isn't left dangling), and `server.js`
verifies the SMTP connection on boot.

## Setup

```bash
npm install
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, and the SMTP_* values in .env
npm run dev
```

### Gmail SMTP quick setup
- Enable 2-Step Verification on the Google account.
- Create an **App Password** (Google Account → Security → App Passwords).
- Use that app password as `SMTP_PASS` — not the normal account password.
- `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`.

## API

| Method | Route | Body |
|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password, role }` |
| POST | `/api/auth/login` | `{ email, password }` |
| POST | `/api/auth/forgot-password` | `{ email }` |
| POST | `/api/auth/reset-password/:token` | `{ password }` |

## Push this to a new GitHub repo

```bash
git init
git add .
git commit -m "Initial commit: school manager with fixed password reset email flow"
git branch -M main
git remote add origin https://github.com/<your-username>/school-manager.git
git push -u origin main
```

(Create the empty repo first at https://github.com/new, name it `school-manager`, then run the commands above from this project folder.)
