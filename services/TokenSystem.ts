
/**
 * Simulated Backend Service
 * In a real production environment, these functions would be API calls to a Node.js server.
 */

const DB_KEY = 'verify_system_db';
const SESSION_KEY = 'verify_system_session';
const API_KEY = '64cb3994119c683652e7f241880b1f4b3dda5e37';

interface TokenRecord {
  token: string;
  expiresAt: number;
  used: boolean;
  sessionId: string;
}

export const TokenSystem = {
  // Generate a secure random token
  generateToken: (): string => {
    const parts = [
      Math.random().toString(36).substring(2, 7).toUpperCase(),
      Math.random().toString(36).substring(2, 7).toUpperCase(),
      Math.random().toString(36).substring(2, 7).toUpperCase()
    ];
    const token = `VX-${parts.join('-')}`;
    
    // Store in "Database"
    const db: TokenRecord[] = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    db.push({
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      used: false,
      sessionId: TokenSystem.getOrCreateSessionId()
    });
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    
    return token;
  },

  // Get or create a persistent session ID for the user
  getOrCreateSessionId: (): string => {
    let id = localStorage.getItem('user_session_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('user_session_id', id);
    }
    return id;
  },

  // Validate a token and update session
  validateToken: (inputToken: string): { success: boolean; message: string } => {
    const db: TokenRecord[] = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const index = db.findIndex(t => t.token === inputToken);

    if (index === -1) return { success: false, message: 'Invalid token format or not found.' };
    
    const record = db[index];
    
    if (record.used) return { success: false, message: 'This token has already been used.' };
    if (Date.now() > record.expiresAt) return { success: false, message: 'Token has expired.' };
    
    // Mark as used
    db[index].used = true;
    localStorage.setItem(DB_KEY, JSON.stringify(db));

    // Create 24h verification session
    const sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      verified: true,
      expiresAt: sessionExpiry
    }));

    return { success: true, message: 'Verification successful!' };
  },

  // Check if current user has an active session
  isVerified: (): boolean => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return false;
    
    const session = JSON.parse(sessionStr);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
    return session.verified;
  },

  // Get shortening redirect URL using the specific Netlify domain
  getShortenedRedirect: (token: string): string => {
    const baseUrl = 'https://vipgyan.vercel.app';
    const destUrl = `${baseUrl}?view=display&token=${token}`;
    return `https://vplink.in/api?api=${API_KEY}&url=${encodeURIComponent(destUrl)}`;
  }
};
