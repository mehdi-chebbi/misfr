const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const app = express();
const PORT = 5001;
const JWT_SECRET = 'misbar_africa_secret_key_2024';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = 'sssssssssssssssss';
const GOOGLE_CLIENT_SECRET = 'sssssssssssssss';
const GOOGLE_REDIRECT_URI = 'http://localhost:5001/api/auth/google/callback';

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Microsoft OAuth Configuration
const MICROSOFT_CLIENT_ID = '';
const MICROSOFT_CLIENT_SECRET = '';
const MICROSOFT_TENANT_ID = '';
const MICROSOFT_REDIRECT_URI = 'http://localhost:5001/api/auth/microsoft/callback';

// Microsoft OAuth endpoints
const MICROSOFT_AUTH_URL = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`;
const MICROSOFT_TOKEN_URL = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;

// PostgreSQL connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'misbar_africa',
  user: 'misbar_user',
  password: 'misbar_password',
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Helper function to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Helper function to verify admin role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
      // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
        microsoft_id VARCHAR(255) UNIQUE,
        institution VARCHAR(255),
        phone_number VARCHAR(20),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add microsoft_id column to existing users table if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS microsoft_id VARCHAR(255) UNIQUE
      `);
      console.log('Microsoft ID column added to users table (if it didn\'t exist)');
    } catch (error) {
      console.log('Microsoft ID column already exists or error adding it:', error.message);
    }

    // Create login_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create chat_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create chat_messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        image_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create forum_categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS forum_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(20) DEFAULT 'green',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create forum_posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS forum_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category_id INTEGER REFERENCES forum_categories(id) ON DELETE CASCADE,
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        views INTEGER DEFAULT 0,
        reply_count INTEGER DEFAULT 0,
        last_reply_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create forum_replies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS forum_replies (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default forum categories if they don't exist
    const defaultCategories = [
      { name: 'General Discussion', description: 'General topics and discussions about Misbar Africa', icon: '💬', color: 'blue' },
      { name: 'Technical Support', description: 'Get help with technical issues and features', icon: '🛠️', color: 'orange' },
      { name: 'Satellite Data Analysis', description: 'Share insights and ask questions about satellite data', icon: '🛰️', color: 'green' },
      { name: 'Regional Focus', description: 'Region-specific discussions across Africa', icon: '🌍', color: 'purple' },
      { name: 'Research & Collaboration', description: 'Academic research and collaboration opportunities', icon: '🔬', color: 'indigo' },
      { name: 'Success Stories', description: 'Share your success stories and case studies', icon: '📈', color: 'emerald' }
    ];

    for (const category of defaultCategories) {
      await pool.query(`
        INSERT INTO forum_categories (name, description, icon, color)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO NOTHING
      `, [category.name, category.description, category.icon, category.color]);
    }

    // Create default admin user if not exists
    const adminEmail = 'admin@misbar.africa';
    const existingAdmin = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(`
        INSERT INTO users (name, last_name, email, password, role)
        VALUES ('Admin', 'User', $1, $2, 'admin')
      `, [adminEmail, hashedPassword]);
      console.log('Default admin user created: admin@misbar.africa / admin123');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, last_name, email, password, institution, phone_number } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(`
      INSERT INTO users (name, last_name, email, password, institution, phone_number)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, last_name, email, institution, phone_number, role
    `, [name, last_name, email, hashedPassword, institution, phone_number]);

    const user = result.rows[0];

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        institution: user.institution,
        phone_number: user.phone_number,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Log login
    await pool.query('INSERT INTO login_logs (user_id) VALUES ($1)', [user.id]);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        institution: user.institution,
        phone_number: user.phone_number,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logout successful' });
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, last_name, email, institution, phone_number, role FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user info' });
  }
});

// Google OAuth Routes
app.get('/api/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent'
  });
  res.json({ url });
});

app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect('http://localhost:3000/auth?error=google_auth_failed');
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'];
    const name = payload['given_name'] || 'User';
    const lastName = payload['family_name'] || '';

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    let user;
    if (existingUser.rows.length > 0) {
      // User exists, update google_id if not set
      user = existingUser.rows[0];
      if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
        user.google_id = googleId;
      }
    } else {
      // Create new user
      const result = await pool.query(`
        INSERT INTO users (name, last_name, email, google_id, role)
        VALUES ($1, $2, $3, $4, 'user')
        RETURNING id, name, last_name, email, google_id, role
      `, [name, lastName, email, googleId]);
      user = result.rows[0];
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie and redirect
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Log login
    await pool.query('INSERT INTO login_logs (user_id) VALUES ($1)', [user.id]);

    res.redirect('http://localhost:3000/auth?success=google_login');
    
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect('http://localhost:3000/auth?error=google_auth_failed');
  }
});

//// Google One-Tap Sign-In (for frontend integration)
//app.post('/api/auth/google/one-tap', async (req, res) => {
//  try {
//    const { credential } = req.body;
//    
//    if (!credential) {
//      return res.status(400).json({ success: false, message: 'No credential provided' });
//    }
//
//    // Verify the Google ID token
//    const ticket = await oauth2Client.verifyIdToken({
//      idToken: credential,
//      audience: GOOGLE_CLIENT_ID
//    });
//
//    const payload = ticket.getPayload();
//    const googleId = payload['sub'];
//    const email = payload['email'];
//    const name = payload['given_name'] || 'User';
//    const lastName = payload['family_name'] || '';
//
//    // Check if user exists
//    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//    
//    let user;
//    if (existingUser.rows.length > 0) {
//      // User exists, update google_id if not set
//      user = existingUser.rows[0];
//      if (!user.google_id) {
//        await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
//        user.google_id = googleId;
//      }
//    } else {
//      // Create new user
//      const result = await pool.query(`
//        INSERT INTO users (name, last_name, email, google_id, role)
//        VALUES ($1, $2, $3, $4, 'user')
//        RETURNING id, name, last_name, email, google_id, role
//      `, [name, lastName, email, googleId]);
//      user = result.rows[0];
//    }
//
//    // Create JWT token
//    const token = jwt.sign(
//      { id: user.id, email: user.email, role: user.role },
//      JWT_SECRET,
//      { expiresIn: '7d' }
//    );
//
//    // Set cookie
//    res.cookie('token', token, {
//      httpOnly: true,
//      secure: false, // Set to true in production with HTTPS
//      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
//    });
//
//    // Log login
//    await pool.query('INSERT INTO login_logs (user_id) VALUES ($1)', [user.id]);
//
//    res.json({
//      success: true,
//      message: 'Google sign-in successful',
//      user: {
//        id: user.id,
//        name: user.name,
//        last_name: user.last_name,
//        email: user.email,
//        institution: user.institution,
//        phone_number: user.phone_number,
//        role: user.role
//      }
//    });
//    
//  } catch (error) {
//    console.error('Google One-Tap error:', error);
//    res.status(500).json({ success: false, message: 'Google authentication failed' });
//  }
//});

// Microsoft OAuth Routes
app.get('/api/auth/microsoft', (req, res) => {
  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: MICROSOFT_REDIRECT_URI,
    scope: 'openid email profile https://graph.microsoft.com/User.Read',
    response_mode: 'query'
  });
  
  const authUrl = `${MICROSOFT_AUTH_URL}?${params.toString()}`;
  res.json({ url: authUrl });
});

app.get('/api/auth/microsoft/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect('http://localhost:3000/auth?error=microsoft_auth_failed');
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post(MICROSOFT_TOKEN_URL, 
      new URLSearchParams({
        client_id: MICROSOFT_CLIENT_ID,
        client_secret: MICROSOFT_CLIENT_SECRET,
        code: code,
        redirect_uri: MICROSOFT_REDIRECT_URI,
        grant_type: 'authorization_code'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, id_token } = tokenResponse.data;

    // Get user info from Microsoft Graph API
    let userData;
    try {
      const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      userData = userResponse.data;
      console.log('Microsoft Graph API response:', userData);
    } catch (graphError) {
      console.error('Microsoft Graph API error:', graphError.response?.status, graphError.response?.data);
      
      // Fallback to ID token data if Graph API fails
      const idTokenPayload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
      userData = {
        id: idTokenPayload.oid,
        displayName: idTokenPayload.name,
        givenName: idTokenPayload.given_name,
        surname: idTokenPayload.family_name,
        mail: idTokenPayload.email,
        userPrincipalName: idTokenPayload.upn || idTokenPayload.email
      };
      console.log('Using ID token fallback:', userData);
    }
    
    // Decode ID token to get email (not always available in Graph API for personal accounts)
    const idTokenPayload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
    
    const microsoftId = userData.id || idTokenPayload.oid;
    const email = userData.mail || userData.userPrincipalName || idTokenPayload.email;
    const name = userData.givenName || idTokenPayload.given_name || 'User';
    const lastName = userData.surname || idTokenPayload.family_name || '';

    console.log('Microsoft user data:', {
      microsoftId,
      email,
      name,
      lastName,
      userData: userData,
      idTokenPayload
    });

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    let user;
    if (existingUser.rows.length > 0) {
      // User exists, update microsoft_id if not set
      user = existingUser.rows[0];
      if (!user.microsoft_id) {
        await pool.query('UPDATE users SET microsoft_id = $1 WHERE id = $2', [microsoftId, user.id]);
        user.microsoft_id = microsoftId;
      }
    } else {
      // Create new user
      const result = await pool.query(`
        INSERT INTO users (name, last_name, email, microsoft_id, role)
        VALUES ($1, $2, $3, $4, 'user')
        RETURNING id, name, last_name, email, microsoft_id, role
      `, [name, lastName, email, microsoftId]);
      user = result.rows[0];
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie and redirect
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Log login
    await pool.query('INSERT INTO login_logs (user_id) VALUES ($1)', [user.id]);

    res.redirect('http://localhost:3000/auth?success=microsoft_login');
    
  } catch (error) {
    console.error('Microsoft OAuth error:', error);
    res.redirect('http://localhost:3000/auth?error=microsoft_auth_failed');
  }
});

// Microsoft One-Tap equivalent (for frontend integration)
app.post('/api/auth/microsoft/token', async (req, res) => {
  try {
    const { access_token, id_token } = req.body;
    
    if (!access_token && !id_token) {
      return res.status(400).json({ success: false, message: 'No token provided' });
    }

    let userData;
    
    if (access_token) {
      // Get user info from Microsoft Graph API
      const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      userData = userResponse.data;
    } else if (id_token) {
      // Decode ID token
      const idTokenPayload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
      userData = {
        id: idTokenPayload.oid,
        displayName: idTokenPayload.name,
        givenName: idTokenPayload.given_name,
        surname: idTokenPayload.family_name,
        mail: idTokenPayload.email,
        userPrincipalName: idTokenPayload.upn || idTokenPayload.email
      };
    }

    const microsoftId = userData.id;
    const email = userData.mail || userData.userPrincipalName;
    const name = userData.givenName || 'User';
    const lastName = userData.surname || '';

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    let user;
    if (existingUser.rows.length > 0) {
      // User exists, update microsoft_id if not set
      user = existingUser.rows[0];
      if (!user.microsoft_id) {
        await pool.query('UPDATE users SET microsoft_id = $1 WHERE id = $2', [microsoftId, user.id]);
        user.microsoft_id = microsoftId;
      }
    } else {
      // Create new user
      const result = await pool.query(`
        INSERT INTO users (name, last_name, email, microsoft_id, role)
        VALUES ($1, $2, $3, $4, 'user')
        RETURNING id, name, last_name, email, microsoft_id, role
      `, [name, lastName, email, microsoftId]);
      user = result.rows[0];
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Log login
    await pool.query('INSERT INTO login_logs (user_id) VALUES ($1)', [user.id]);

    res.json({
      success: true,
      message: 'Microsoft sign-in successful',
      user: {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        institution: user.institution,
        phone_number: user.phone_number,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Microsoft token error:', error);
    res.status(500).json({ success: false, message: 'Microsoft authentication failed' });
  }
});

// Admin Routes
app.get('/api/admin/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, last_name, email, institution, phone_number, role, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to get users' });
  }
});

app.put('/api/admin/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, last_name, email, institution, phone_number, role } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user
    const result = await pool.query(`
      UPDATE users 
      SET name = $1, last_name = $2, email = $3, institution = $4, phone_number = $5, role = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, name, last_name, email, institution, phone_number, role
    `, [name, last_name, email, institution, phone_number, role, id]);

    res.json({
      success: true,
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

app.get('/api/admin/login-logs', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ll.login_time, u.name, u.last_name, u.email
      FROM login_logs ll
      JOIN users u ON ll.user_id = u.id
      ORDER BY ll.login_time DESC
      LIMIT 100
    `);
    
    res.json({
      success: true,
      logs: result.rows
    });
  } catch (error) {
    console.error('Get login logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to get login logs' });
  }
});

// User Profile Update
app.put('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const { name, last_name, institution, phone_number } = req.body;

    const result = await pool.query(`
      UPDATE users 
      SET name = $1, last_name = $2, institution = $3, phone_number = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, name, last_name, email, institution, phone_number, role
    `, [name, last_name, institution, phone_number, req.user.id]);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Chat History Routes
app.get('/api/chat/sessions', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, created_at, updated_at
      FROM chat_sessions
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `, [req.user.id]);
    
    res.json({
      success: true,
      sessions: result.rows
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get chat sessions' });
  }
});

app.post('/api/chat/sessions', verifyToken, async (req, res) => {
  try {
    const { title } = req.body;
    
    const result = await pool.query(`
      INSERT INTO chat_sessions (user_id, title)
      VALUES ($1, $2)
      RETURNING id, title, created_at, updated_at
    `, [req.user.id, title || 'New Chat']);

    res.json({
      success: true,
      session: result.rows[0]
    });
  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({ success: false, message: 'Failed to create chat session' });
  }
});

app.get('/api/chat/sessions/:sessionId/messages', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Verify session belongs to user
    const sessionCheck = await pool.query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );
    
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }
    
    const result = await pool.query(`
      SELECT role, content, image_data, created_at
      FROM chat_messages
      WHERE session_id = $1
      ORDER BY created_at ASC
    `, [sessionId]);
    
    res.json({
      success: true,
      messages: result.rows
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to get chat messages' });
  }
});

app.post('/api/chat/sessions/:sessionId/messages', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { role, content, image_data } = req.body;
    
    // Verify session belongs to user
    const sessionCheck = await pool.query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );
    
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }
    
    const result = await pool.query(`
      INSERT INTO chat_messages (session_id, role, content, image_data)
      VALUES ($1, $2, $3, $4)
      RETURNING id, role, content, image_data, created_at
    `, [sessionId, role, content, image_data || null]);
    
    // Update session updated_at
    await pool.query(
      'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [sessionId]
    );
    
    res.json({
      success: true,
      message: result.rows[0]
    });
  } catch (error) {
    console.error('Save chat message error:', error);
    res.status(500).json({ success: false, message: 'Failed to save chat message' });
  }
});

app.put('/api/chat/sessions/:sessionId', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    
    const result = await pool.query(`
      UPDATE chat_sessions 
      SET title = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING id, title, created_at, updated_at
    `, [title, sessionId, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }
    
    res.json({
      success: true,
      session: result.rows[0]
    });
  } catch (error) {
    console.error('Update chat session error:', error);
    res.status(500).json({ success: false, message: 'Failed to update chat session' });
  }
});

app.delete('/api/chat/sessions/:sessionId', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }
    
    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete chat session' });
  }
});

// Forum API Routes

// Get all forum categories
app.get('/api/forum/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT fc.*, 
             COUNT(fp.id) as post_count
      FROM forum_categories fc
      LEFT JOIN forum_posts fp ON fc.id = fp.category_id
      GROUP BY fc.id
      ORDER BY fc.name
    `);
    
    res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to get categories' });
  }
});

// Get all posts with pagination and filtering
app.get('/api/forum/posts', async (req, res) => {
  try {
    const { category_id, page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    let paramIndex = 1;
    
    if (category_id) {
      whereClause += ` AND fp.category_id = $${paramIndex++}`;
      queryParams.push(category_id);
    }
    
    if (search) {
      whereClause += ` AND (fp.title ILIKE $${paramIndex++} OR fp.content ILIKE $${paramIndex++})`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    const postsQuery = `
      SELECT fp.*, 
             u.name as author_name, 
             u.last_name as author_last_name,
             u.institution as author_institution,
             fc.name as category_name,
             fc.color as category_color,
             fc.icon as category_icon
      FROM forum_posts fp
      JOIN users u ON fp.author_id = u.id
      JOIN forum_categories fc ON fp.category_id = fc.id
      ${whereClause}
      ORDER BY fp.last_reply_at DESC NULLS LAST, fp.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    queryParams.push(limit, offset);
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM forum_posts fp
      ${whereClause}
    `;
    
    const [postsResult, countResult] = await Promise.all([
      pool.query(postsQuery, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);
    
    res.json({
      success: true,
      posts: postsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ success: false, message: 'Failed to get posts' });
  }
});

// Get single post with replies
app.get('/api/forum/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Increment view count
    await pool.query('UPDATE forum_posts SET views = views + 1 WHERE id = $1', [postId]);
    
    // Get post details
    const postResult = await pool.query(`
      SELECT fp.*, 
             u.name as author_name, 
             u.last_name as author_last_name,
             u.institution as author_institution,
             u.role as author_role,
             fc.name as category_name,
             fc.color as category_color
      FROM forum_posts fp
      JOIN users u ON fp.author_id = u.id
      JOIN forum_categories fc ON fp.category_id = fc.id
      WHERE fp.id = $1
    `, [postId]);
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Get replies
    const repliesResult = await pool.query(`
      SELECT fr.*, 
             u.name as author_name, 
             u.last_name as author_last_name,
             u.institution as author_institution,
             u.role as author_role
      FROM forum_replies fr
      JOIN users u ON fr.author_id = u.id
      WHERE fr.post_id = $1
      ORDER BY fr.created_at ASC
    `, [postId]);
    
    res.json({
      success: true,
      post: postResult.rows[0],
      replies: repliesResult.rows
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ success: false, message: 'Failed to get post' });
  }
});

// Create new post
app.post('/api/forum/posts', verifyToken, async (req, res) => {
  try {
    const { title, content, category_id } = req.body;
    const userId = req.user.id;
    
    if (!title || !content || !category_id) {
      return res.status(400).json({ success: false, message: 'Title, content, and category are required' });
    }
    
    const result = await pool.query(`
      INSERT INTO forum_posts (title, content, category_id, author_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [title, content, category_id, userId]);
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

// Create reply
app.post('/api/forum/posts/:id/replies', verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }
    
    // Check if post exists
    const postCheck = await pool.query('SELECT id FROM forum_posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Create reply
    const replyResult = await pool.query(`
      INSERT INTO forum_replies (content, post_id, author_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [content, postId, userId]);
    
    // Update post's reply count and last reply time
    await pool.query(`
      UPDATE forum_posts 
      SET reply_count = reply_count + 1, 
          last_reply_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [postId]);
    
    res.status(201).json({
      success: true,
      message: 'Reply created successfully',
      reply: replyResult.rows[0]
    });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({ success: false, message: 'Failed to create reply' });
  }
});

// Update post
app.put('/api/forum/posts/:id', verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content } = req.body;
    const userId = req.user.id;
    
    // Check if user owns the post or is admin
    const postCheck = await pool.query(
      'SELECT author_id FROM forum_posts WHERE id = $1', 
      [postId]
    );
    
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const post = postCheck.rows[0];
    if (post.author_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
    }
    
    const result = await pool.query(`
      UPDATE forum_posts 
      SET title = COALESCE($1, title), 
          content = COALESCE($2, content),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [title, content, postId]);
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ success: false, message: 'Failed to update post' });
  }
});

// Delete post
app.delete('/api/forum/posts/:id', verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    // Check if user owns the post or is admin
    const postCheck = await pool.query(
      'SELECT author_id FROM forum_posts WHERE id = $1', 
      [postId]
    );
    
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const post = postCheck.rows[0];
    if (post.author_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }
    
    await pool.query('DELETE FROM forum_posts WHERE id = $1', [postId]);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
});

// Start server
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`Auth server running on http://localhost:${PORT}`);
    console.log('Default admin: admin@misbar.africa / admin123');
  });
};

startServer().catch(console.error);