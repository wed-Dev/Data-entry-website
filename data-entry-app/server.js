const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Database setup
const dbPath = path.join(__dirname, 'transactions.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to database');
});

// Helper functions
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Middleware to verify authentication
function authenticate(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    db.get(`
        SELECT u.* FROM users u
        JOIN sessions s ON u.id = s.userId
        WHERE s.token = ? AND s.expiresAt > datetime('now')
    `, [token], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        req.user = user;
        next();
    });
}

// Create tables
db.serialize(() => {
    // Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            clientName TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Error creating users table:', err.message);
        else console.log('✅ Users table ready');
    });

    // Transactions table
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customerId TEXT NOT NULL,
            currentLocation TEXT NOT NULL,
            destinationLocation TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            price REAL NOT NULL,
            userId INTEGER NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('❌ Error creating table:', err.message);
        else console.log('✅ Transactions table ready');
    });

    // Sessions table
    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expiresAt DATETIME NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('Error creating sessions table:', err.message);
        else console.log('✅ Sessions table ready');
    });

    // Create default admin account (password: admin123)
    const adminPassword = hashPassword('admin123');
    db.run(`
        INSERT OR IGNORE INTO users (username, password, role, clientName)
        VALUES ('admin', ?, 'admin', 'Administrator')
    `, [adminPassword], (err) => {
        if (err) console.error('Error creating admin:', err.message);
        else console.log('✅ Default admin account ready (username: admin, password: admin123)');
    });
});

// ============= AUTH ROUTES =============

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const hashedPassword = hashPassword(password);
    
    db.get(`
        SELECT * FROM users WHERE username = ? AND password = ?
    `, [username, hashedPassword], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Create session
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        db.run(`
            INSERT INTO sessions (userId, token, expiresAt)
            VALUES (?, ?, ?)
        `, [user.id, token, expiresAt.toISOString()], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to create session' });
            }

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    clientName: user.clientName
                }
            });
        });
    });
});

// Logout
app.post('/api/auth/logout', authenticate, (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    db.run('DELETE FROM sessions WHERE token = ?', [token], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Verify session
app.get('/api/auth/verify', authenticate, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user.id,
            username: req.user.username,
            role: req.user.role,
            clientName: req.user.clientName
        }
    });
});

// ============= USER MANAGEMENT (Admin Only) =============

// Get all users
app.get('/api/users', authenticate, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    db.all('SELECT id, username, role, clientName, createdAt FROM users', [], (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
        res.json({ success: true, users });
    });
});

// Create new user/client
app.post('/api/users', authenticate, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { username, password, role, clientName } = req.body;
    
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Username, password, and role required' });
    }

    const hashedPassword = hashPassword(password);

    db.run(`
        INSERT INTO users (username, password, role, clientName)
        VALUES (?, ?, ?, ?)
    `, [username, hashedPassword, role, clientName || username], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            return res.status(500).json({ error: 'Failed to create user' });
        }

        res.json({
            success: true,
            message: 'User created successfully',
            userId: this.lastID
        });
    });
});

// Delete user
app.delete('/api/users/:id', authenticate, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    if (id == req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete user' });
        }
        res.json({ success: true, message: 'User deleted successfully' });
    });
});

// Change password
app.post('/api/users/change-password', authenticate, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password required' });
    }

    const currentHashed = hashPassword(currentPassword);
    const newHashed = hashPassword(newPassword);

    db.get('SELECT * FROM users WHERE id = ? AND password = ?', [req.user.id, currentHashed], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        db.run('UPDATE users SET password = ? WHERE id = ?', [newHashed, req.user.id], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to change password' });
            }
            res.json({ success: true, message: 'Password changed successfully' });
        });
    });
});

// ============= TRANSACTION ROUTES =============

// Get transactions (filtered by role)
app.get('/api/transactions', authenticate, (req, res) => {
    let sql = 'SELECT t.*, u.clientName FROM transactions t JOIN users u ON t.userId = u.id';
    let params = [];

    if (req.user.role === 'client') {
        sql += ' WHERE t.userId = ?';
        params.push(req.user.id);
    }

    sql += ' ORDER BY t.date DESC, t.time DESC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch transactions' });
        }
        res.json({ success: true, transactions: rows });
    });
});

// Add transaction
app.post('/api/transactions', authenticate, (req, res) => {
    const { customerId, currentLocation, destinationLocation, date, time, price, userId } = req.body;
    
    if (!customerId || !currentLocation || !destinationLocation || !date || !time || !price) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Determine which user to assign transaction to
    let targetUserId = req.user.id;
    
    // Admin can create transactions for specific clients
    if (req.user.role === 'admin' && userId) {
        targetUserId = userId;
    }

    const sql = `INSERT INTO transactions (customerId, currentLocation, destinationLocation, date, time, price, userId) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [customerId, currentLocation, destinationLocation, date, time, parseFloat(price), targetUserId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to save transaction' });
        }
        res.json({ 
            success: true, 
            message: 'Transaction saved successfully',
            id: this.lastID 
        });
    });
});

// Update transaction
app.put('/api/transactions/:id', authenticate, (req, res) => {
    const { customerId, currentLocation, destinationLocation, date, time, price } = req.body;
    const { id } = req.params;

    // Check ownership
    db.get('SELECT * FROM transactions WHERE id = ?', [id], (err, transaction) => {
        if (err || !transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (req.user.role !== 'admin' && transaction.userId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const sql = `UPDATE transactions 
                     SET customerId = ?, currentLocation = ?, destinationLocation = ?, date = ?, time = ?, price = ?
                     WHERE id = ?`;
        
        db.run(sql, [customerId, currentLocation, destinationLocation, date, time, parseFloat(price), id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update transaction' });
            }
            res.json({ success: true, message: 'Transaction updated successfully' });
        });
    });
});

// Delete transaction
app.delete('/api/transactions/:id', authenticate, (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM transactions WHERE id = ?', [id], (err, transaction) => {
        if (err || !transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (req.user.role !== 'admin' && transaction.userId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        db.run('DELETE FROM transactions WHERE id = ?', [id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete transaction' });
            }
            res.json({ success: true, message: 'Transaction deleted successfully' });
        });
    });
});

// Get statistics
app.get('/api/stats', authenticate, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    let whereClause = '';
    let params = [today, today];

    if (req.user.role === 'client') {
        whereClause = 'WHERE userId = ?';
        params.push(req.user.id);
    }

    db.get(`
        SELECT 
            COUNT(*) as total,
            COALESCE(SUM(price), 0) as totalRevenue,
            COALESCE(SUM(CASE WHEN date = ? THEN 1 ELSE 0 END), 0) as todayCount,
            COALESCE(SUM(CASE WHEN date = ? THEN price ELSE 0 END), 0) as todayRevenue
        FROM transactions
        ${whereClause}
    `, params, (err, stats) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch statistics' });
        }
        res.json({ success: true, stats });
    });
});

// Get monthly report
app.get('/api/monthly/:year/:month', authenticate, (req, res) => {
    const { year, month } = req.params;
    const monthStr = `${year}-${month.padStart(2, '0')}`;
    
    let whereClause = 'WHERE date LIKE ?';
    let params = [`${monthStr}%`];

    if (req.user.role === 'client') {
        whereClause += ' AND userId = ?';
        params.push(req.user.id);
    }

    db.all(`
        SELECT * FROM transactions 
        ${whereClause}
        ORDER BY date DESC, time DESC
    `, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch monthly data' });
        }
        
        const totalRevenue = rows.reduce((sum, t) => sum + t.price, 0);
        res.json({ 
            success: true, 
            transactions: rows,
            totalRevenue,
            totalCount: rows.length
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SECURE SERVER STARTED');
    console.log('='.repeat(60));
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📊 Login: http://localhost:${PORT}/login.html`);
    console.log(`💾 Database: ${dbPath}`);
    console.log('='.repeat(60));
    console.log('🔐 Default Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');
    console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error(err.message);
        console.log('\n👋 Server closed');
        process.exit(0);
    });
});
