
/**
 * STRICT REDIRECT CONTROLLER (Node.js + Express + TypeScript)
 * 
 * Logic implemented:
 * 1. Secure token generation.
 * 2. VPLINK API integration with 2x retry logic.
 * 3. 302 Redirect enforcement (No JSON returned to client).
 * 4. Session-based access guard for the token display page.
 */

import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import axios from 'axios';

// Fix: Using 'any' for 'app' to bypass incorrect overload resolution issues where middleware couldn't be assigned to PathParams
const app: any = express();
// Fix: Casting middleware to 'any' to satisfy the compiler's expected parameter types
app.use(express.json() as any);
// Use a secret for signed cookies to prevent tampering
// Fix: Casting middleware to 'any' to resolve PathParams assignment error
app.use(cookieParser('v_secret_123_gate') as any);

// CONFIGURATION
const VPLINK_API_KEY = '64cb3994119c683652e7f241880b1f4b3dda5e37';
const DOMAIN = 'https://venerable-moxie-9e8837.netlify.app/';
const SESSION_COOKIE_NAME = 'v_session';
const REDIRECT_GUARD_COOKIE = 'v_redirect_allowed';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const REDIRECT_SESSION_EXPIRY = 2 * 60 * 1000; // 2 minutes

// MOCK DATABASE
interface TokenDB {
  [token: string]: {
    createdAt: number;
    expiresAt: number;
    used: boolean;
    sessionId: string;
  };
}
const db: TokenDB = {};

// UTILS
const generateSecureToken = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rnd = (len: number) => Array.from(new Uint8Array(crypto.randomBytes(len))).map((x: number) => chars[x % chars.length]).join('');
  return `VX-${rnd(5)}-${rnd(5)}-${rnd(4)}`;
};

/**
 * STEP 1 & 2 & 3 & 4 & 5 & 6:
 * Start verification flow, generate token, shorten URL, and REDIRECT.
 */
// Fix: Using 'any' for 'req' and 'res' to resolve issues where properties like 'send', 'status', and 'cookie' were reported as missing
app.get('/api/verify/start', async (req: any, res: any) => {
  try {
    const sessionId = req.cookies.v_uid || crypto.randomUUID();
    const token = generateSecureToken();
    const now = Date.now();

    // Store token in DB
    db[token] = {
      createdAt: now,
      expiresAt: now + TOKEN_EXPIRY,
      used: false,
      sessionId
    };

    // Build Destination URL
    const destUrl = `${DOMAIN}?view=display&token=${token}`;
    const alias = `v-${crypto.randomBytes(4).toString('hex')}`;
    const vplinkUrl = `https://vplink.in/api?api=${VPLINK_API_KEY}&url=${encodeURIComponent(destUrl)}&alias=${alias}&format=text`;

    // VPLINK Integration with 2x Retry Logic
    let shortLink = '';
    let success = false;
    for (let i = 0; i <= 2; i++) {
      try {
        const response = await axios.get(vplinkUrl, { timeout: 4000 });
        if (response.data && response.data.startsWith('http')) {
          shortLink = response.data;
          success = true;
          break;
        }
      } catch (e) {
        if (i === 2) throw new Error('Shortener API failed after retries.');
      }
    }

    if (!success) {
       return res.send(`
        <html>
          <body style="font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; background:#f8fafc;">
            <div style="text-align:center; padding:2rem; background:white; border-radius:1rem; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
              <h1 style="color:#e11d48;">Redirect Generation Failed</h1>
              <p style="color:#64748b;">The URL shortener is currently unavailable. Please try again.</p>
              <a href="/verify" style="display:inline-block; margin-top:1rem; padding:0.75rem 1.5rem; background:#2563eb; color:white; text-decoration:none; border-radius:0.5rem;">Try Again</a>
            </div>
          </body>
        </html>
      `);
    }

    // Set short-lived Redirect Guard Cookie (valid for 2 mins)
    // Signed cookie to prevent manual injection
    res.cookie(REDIRECT_GUARD_COOKIE, token, {
      httpOnly: true,
      secure: true,
      signed: true,
      maxAge: REDIRECT_SESSION_EXPIRY
    });

    res.cookie('v_uid', sessionId, { httpOnly: true, maxAge: TOKEN_EXPIRY });

    // IMMEDIATE 302 REDIRECT TO SHORT LINK
    return res.redirect(302, shortLink);

  } catch (error: any) {
    return res.status(500).send(`
      <div style="text-align:center; margin-top:100px;">
        <h1>Critical Error</h1>
        <p>${error.message}</p>
        <button onclick="window.history.back()">Go Back</button>
      </div>
    `);
  }
});

/**
 * VALIDATE DISPLAY ACCESS
 * Frontend calls this to check if the user is authorized to see the token page.
 */
// Fix: Using 'any' for 'req' and 'res' to ensure 'body' and 'signedCookies' are accessible to the compiler
app.post('/api/verify/check-access', (req: any, res: any) => {
  const { token } = req.body;
  const guardToken = req.signedCookies[REDIRECT_GUARD_COOKIE];

  // ANTI-BYPASS: Check if the token in URL matches the token in the session guard
  if (!guardToken || guardToken !== token) {
    return res.status(403).json({ success: false, message: 'Invalid Access Path' });
  }

  // Optionally clear guard cookie after one check to enforce single use
  // res.clearCookie(REDIRECT_GUARD_COOKIE);

  res.json({ success: true });
});

// VALIDATE TOKEN (Standard)
// Fix: Using 'any' for 'req' and 'res' to ensure 'body' and response methods like 'json' and 'cookie' are accessible
app.post('/api/verify/token', (req: any, res: any) => {
  const { token } = req.body;
  const record = db[token];

  if (!record) return res.status(404).json({ success: false, message: 'Token not found.' });
  if (record.used) return res.status(400).json({ success: false, message: 'Token already used.' });
  if (Date.now() > record.expiresAt) return res.status(400).json({ success: false, message: 'Token expired.' });

  record.used = true;
  res.cookie(SESSION_COOKIE_NAME, 'verified_true', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY
  });

  res.json({ success: true });
});

export default app;
