
/**
 * API SERVICE LAYER
 */

const DOMAIN = 'https://venerable-moxie-9e8837.netlify.app/';

export const ApiService = {
  checkSession: async (): Promise<boolean> => {
    const session = localStorage.getItem('v_session_expiry');
    if (!session) return false;
    return Date.now() < parseInt(session);
  },

  // This now triggers the backend flow which performs the redirect
  startVerification: async (): Promise<void> => {
    // In production, we navigate the window to the backend start endpoint
    // which then handles the token generation and 302 redirect.
    window.location.href = '/api/verify/start';
  },

  // Validate the token display access (Anti-Bypass check)
  validateDisplayAccess: async (token: string): Promise<boolean> => {
    // In demo environment, we check local storage mock flags
    const guard = localStorage.getItem('v_redirect_active');
    const guardToken = localStorage.getItem('v_redirect_token');
    
    if (guard === 'true' && guardToken === token) {
      // Access granted. One-time use: clear flag
      localStorage.removeItem('v_redirect_active');
      return true;
    }
    
    // Fallback for real backend call in production:
    // const res = await axios.post('/api/verify/check-access', { token });
    // return res.data.success;
    
    return false;
  },

  validateToken: async (token: string): Promise<{ success: boolean; message?: string }> => {
    const db = JSON.parse(localStorage.getItem('v_token_db') || '{}');
    const record = db[token];

    if (!record) return { success: false, message: "Token invalid." };
    if (record.used) return { success: false, message: "Token already used." };
    if (Date.now() > record.expiresAt) return { success: false, message: "Token expired." };

    record.used = true;
    localStorage.setItem('v_token_db', JSON.stringify(db));
    localStorage.setItem('v_session_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());

    return { success: true };
  },

  // Mock implementation for demo environment
  mockInitiateRedirect: async () => {
    const token = `VX-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const db = JSON.parse(localStorage.getItem('v_token_db') || '{}');
    db[token] = { createdAt: Date.now(), expiresAt: Date.now() + 86400000, used: false };
    localStorage.setItem('v_token_db', JSON.stringify(db));

    // Set the guard flag for display access
    localStorage.setItem('v_redirect_active', 'true');
    localStorage.setItem('v_redirect_token', token);

    const destUrl = `${DOMAIN}?view=display&token=${token}`;
    const vplinkUrl = `https://vplink.in/api?api=64cb3994119c683652e7f241880b1f4b3dda5e37&url=${encodeURIComponent(destUrl)}&format=text`;

    try {
      // Step 1: Fetch the content of the API response (which is the short URL text)
      const response = await fetch(vplinkUrl);
      const shortUrl = await response.text();
      
      // Step 2: Clean and validate the received URL
      const cleanUrl = shortUrl.trim();
      
      if (cleanUrl && cleanUrl.startsWith('http')) {
        // Step 3: Perform immediate browser redirect to the actual short link (e.g., https://vplink.in/qVfBKz)
        window.location.href = cleanUrl;
      } else {
        // Fallback if the response is empty or invalid
        window.location.href = vplinkUrl;
      }
    } catch (e) {
      console.error('Failed to fetch short link:', e);
      // In case of CORS or network error, we fall back to the direct API navigation 
      // so the user can manually click the link if necessary.
      window.location.href = vplinkUrl;
    }
  }
};
