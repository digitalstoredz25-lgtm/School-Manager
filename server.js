require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const { getTransporter } = require('./utils/sendEmail');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Verify SMTP connection on boot so a broken email config is caught
    // immediately in the logs, not silently the first time someone requests
    // a password reset.
    try {
      await getTransporter().verify();
      console.log('SMTP connection verified — outgoing email is configured correctly');
    } catch (smtpErr) {
      console.warn(
        'WARNING: SMTP verification failed — password reset emails will NOT send:',
        smtpErr.message
      );
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
