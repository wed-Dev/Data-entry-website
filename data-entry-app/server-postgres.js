const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const db = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Database initialization flag
let dbInitialized = false;

// Initialize database automatically on first request
async function ensureDatabase() {
    if (!dbInitialized) {
        try {
            await db.initializeDatabase();
            dbInitialized = true;
            console.log('✅ Database initialized successfully');
        } catch (error) {
            console.error('⚠️ Database initialization error (may already exist):', error.message);
            // Mark as initialized even if tables exist - this is OK
            dbInitialized = true;
        }
    }
}

// Helper functions
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Middleware to verify authentication
async function authenticate(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const user = await db.findUserByToken(token);
        if (!user) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Authentication error' });
    }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
    await ensureDatabase();
    res.json({ status: 'ok', timestamp: new Date().toISOString(), dbInitialized });
});

// Manual database initialization endpoint (for troubleshooting)
app.post('/api/init', async (req, res) => {
    try {
        await db.initializeDatabase();
        dbInitialized = true;
        res.json({ success: true, message: 'Database initialized' });
    } catch (error) {
        console.error('Init error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============= AUTH ROUTES =============

// Login
app.post('/api/auth/login', async (req, res) => {
    await ensureDatabase(); // Ensure DB is initialized before login
    
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        const hashedPassword = db.hashPassword(password);
        const user = await db.findUserByCredentials(username, hashedPassword);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Create session
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

        await db.createSession(user.id, token, expiresAt);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                clientName: user.clientname || user.clientName
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
app.post('/api/auth/logout', authenticate, async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    try {
        await db.deleteSession(token);
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

// Verify session
app.get('/api/auth/verify', authenticate, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user.id,
            username: req.user.username,
            role: req.user.role,
            clientName: req.user.clientname || req.user.clientName
        }
    });
});

// ============= USER MANAGEMENT (Admin Only) =============

// Get all users
app.get('/api/users', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const users = await db.getAllUsers();
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create new user/client
app.post('/api/users', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { username, password, role, clientName } = req.body;
    
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Username, password, and role required' });
    }

    try {
        const hashedPassword = db.hashPassword(password);
        const result = await db.createUser(username, hashedPassword, role, clientName);
        
        res.json({
            success: true,
            message: 'User created successfully',
            userId: result.userId
        });
    } catch (error) {
        if (error.message.includes('already exists')) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Delete user
app.delete('/api/users/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    if (id == req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    try {
        await db.deleteUser(id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Change password
app.post('/api/users/change-password', authenticate, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password required' });
    }

    try {
        const currentHashed = db.hashPassword(currentPassword);
        const user = await db.findUserByCredentials(req.user.username, currentHashed);
        
        if (!user) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const newHashed = db.hashPassword(newPassword);
        await db.changePassword(req.user.id, newHashed);
        
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// ============= TRANSACTION ROUTES =============

// Get transactions (filtered by role)
app.get('/api/transactions', authenticate, async (req, res) => {
    try {
        const transactions = await db.getTransactions(req.user.id, req.user.role);
        res.json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Add transaction
app.post('/api/transactions', authenticate, async (req, res) => {
    const { customerId, currentLocation, destinationLocation, date, time, price, userId } = req.body;
    
    if (!customerId || !currentLocation || !destinationLocation || !date || !time || !price) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Determine which user to assign transaction to
        let targetUserId = req.user.id;
        
        // Admin can create transactions for specific clients
        if (req.user.role === 'admin' && userId) {
            targetUserId = userId;
        }

        const result = await db.createTransaction(
            customerId,
            currentLocation,
            destinationLocation,
            date,
            time,
            parseFloat(price),
            targetUserId
        );
        
        res.json({ 
            success: true, 
            message: 'Transaction saved successfully',
            id: result.id
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save transaction' });
    }
});

// Update transaction
app.put('/api/transactions/:id', authenticate, async (req, res) => {
    const { customerId, currentLocation, destinationLocation, date, time, price } = req.body;
    const { id } = req.params;

    try {
        const transaction = await db.findTransactionById(id);
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (req.user.role !== 'admin' && transaction.userid !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await db.updateTransaction(id, customerId, currentLocation, destinationLocation, date, time, parseFloat(price));
        res.json({ success: true, message: 'Transaction updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update transaction' });
    }
});

// Delete transaction
app.delete('/api/transactions/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const transaction = await db.findTransactionById(id);
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (req.user.role !== 'admin' && transaction.userid !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await db.deleteTransaction(id);
        res.json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
});

// Get statistics
app.get('/api/stats', authenticate, async (req, res) => {
    try {
        const stats = await db.getStatistics(req.user.id, req.user.role);
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get monthly report
app.get('/api/monthly/:year/:month', authenticate, async (req, res) => {
    const { year, month } = req.params;
    
    try {
        const transactions = await db.getMonthlyReport(year, month, req.user.id, req.user.role);
        const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.price), 0);
        
        res.json({ 
            success: true, 
            transactions,
            totalRevenue,
            totalCount: transactions.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch monthly data' });
    }
});

// For local development
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    
    // Initialize database for local development
    db.initializeDatabase()
        .then(() => {
            app.listen(PORT, () => {
                console.log('\n' + '='.repeat(60));
                console.log('🚀 SECURE SERVER STARTED (POSTGRES)');
                console.log('='.repeat(60));
                console.log(`📍 URL: http://localhost:${PORT}`);
                console.log(`📊 Login: http://localhost:${PORT}/login.html`);
                console.log('='.repeat(60));
                console.log('🔐 Default Admin Credentials:');
                console.log('   Username: admin');
                console.log('   Password: admin123');
                console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');
                console.log('='.repeat(60) + '\n');
            });
        })
        .catch(err => {
            console.error('Failed to initialize database:', err);
            process.exit(1);
        });
}

module.exports = app;
