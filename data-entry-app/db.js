const { sql } = require('@vercel/postgres');
const crypto = require('crypto');

// Helper function for password hashing
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Initialize database schema
async function initializeDatabase() {
    try {
        // Create all tables in a single transaction for speed
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                clientName TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                token TEXT UNIQUE NOT NULL,
                expiresAt TIMESTAMP NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                customerId TEXT NOT NULL,
                currentLocation TEXT NOT NULL,
                destinationLocation TEXT NOT NULL,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                price NUMERIC(12,2) NOT NULL,
                userId INTEGER NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Create default admin account
        const adminPassword = hashPassword('admin123');
        await sql`
            INSERT INTO users (username, password, role, clientName)
            VALUES ('admin', ${adminPassword}, 'admin', 'Administrator')
            ON CONFLICT (username) DO NOTHING
        `;

        return { success: true };
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        // If tables already exist, this is OK
        if (error.message && (error.message.includes('already exists') || error.message.includes('duplicate'))) {
            return { success: true };
        }
        throw error;
    }
}

// User operations
async function findUserByCredentials(username, hashedPassword) {
    try {
        const result = await sql`
            SELECT * FROM users 
            WHERE username = ${username} AND password = ${hashedPassword}
        `;
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding user:', error);
        throw error;
    }
}

async function findUserByToken(token) {
    try {
        const result = await sql`
            SELECT u.* FROM users u
            JOIN sessions s ON u.id = s.userId
            WHERE s.token = ${token} AND s.expiresAt > NOW()
        `;
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding user by token:', error);
        throw error;
    }
}

async function createSession(userId, token, expiresAt) {
    try {
        await sql`
            INSERT INTO sessions (userId, token, expiresAt)
            VALUES (${userId}, ${token}, ${expiresAt})
        `;
        return { success: true };
    } catch (error) {
        console.error('Error creating session:', error);
        throw error;
    }
}

async function deleteSession(token) {
    try {
        await sql`DELETE FROM sessions WHERE token = ${token}`;
        return { success: true };
    } catch (error) {
        console.error('Error deleting session:', error);
        throw error;
    }
}

async function getAllUsers() {
    try {
        const result = await sql`
            SELECT id, username, role, clientName, createdAt 
            FROM users
            ORDER BY createdAt DESC
        `;
        return result.rows;
    } catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
}

async function createUser(username, hashedPassword, role, clientName) {
    try {
        const result = await sql`
            INSERT INTO users (username, password, role, clientName)
            VALUES (${username}, ${hashedPassword}, ${role}, ${clientName || username})
            RETURNING id
        `;
        return { success: true, userId: result.rows[0].id };
    } catch (error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique')) {
            throw new Error('Username already exists');
        }
        console.error('Error creating user:', error);
        throw error;
    }
}

async function deleteUser(userId) {
    try {
        await sql`DELETE FROM users WHERE id = ${userId}`;
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

async function changePassword(userId, newHashedPassword) {
    try {
        await sql`
            UPDATE users 
            SET password = ${newHashedPassword} 
            WHERE id = ${userId}
        `;
        return { success: true };
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
}

// Transaction operations
async function getTransactions(userId = null, role = 'client') {
    try {
        let result;
        if (role === 'admin') {
            result = await sql`
                SELECT t.*, u.clientName 
                FROM transactions t 
                JOIN users u ON t.userId = u.id
                ORDER BY t.date DESC, t.time DESC
            `;
        } else {
            result = await sql`
                SELECT t.*, u.clientName 
                FROM transactions t 
                JOIN users u ON t.userId = u.id
                WHERE t.userId = ${userId}
                ORDER BY t.date DESC, t.time DESC
            `;
        }
        return result.rows;
    } catch (error) {
        console.error('Error getting transactions:', error);
        throw error;
    }
}

async function createTransaction(customerId, currentLocation, destinationLocation, date, time, price, userId) {
    try {
        const result = await sql`
            INSERT INTO transactions (customerId, currentLocation, destinationLocation, date, time, price, userId)
            VALUES (${customerId}, ${currentLocation}, ${destinationLocation}, ${date}, ${time}, ${price}, ${userId})
            RETURNING id
        `;
        return { success: true, id: result.rows[0].id };
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
}

async function findTransactionById(id) {
    try {
        const result = await sql`
            SELECT * FROM transactions WHERE id = ${id}
        `;
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding transaction:', error);
        throw error;
    }
}

async function updateTransaction(id, customerId, currentLocation, destinationLocation, date, time, price) {
    try {
        await sql`
            UPDATE transactions 
            SET customerId = ${customerId}, 
                currentLocation = ${currentLocation}, 
                destinationLocation = ${destinationLocation}, 
                date = ${date}, 
                time = ${time}, 
                price = ${price}
            WHERE id = ${id}
        `;
        return { success: true };
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }
}

async function deleteTransaction(id) {
    try {
        await sql`DELETE FROM transactions WHERE id = ${id}`;
        return { success: true };
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
}

async function getStatistics(userId = null, role = 'client') {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        let result;
        if (role === 'admin') {
            result = await sql`
                SELECT 
                    COUNT(*) as total,
                    COALESCE(SUM(price), 0) as totalRevenue,
                    COALESCE(SUM(CASE WHEN date = ${today} THEN 1 ELSE 0 END), 0) as todayCount,
                    COALESCE(SUM(CASE WHEN date = ${today} THEN price ELSE 0 END), 0) as todayRevenue
                FROM transactions
            `;
        } else {
            result = await sql`
                SELECT 
                    COUNT(*) as total,
                    COALESCE(SUM(price), 0) as totalRevenue,
                    COALESCE(SUM(CASE WHEN date = ${today} THEN 1 ELSE 0 END), 0) as todayCount,
                    COALESCE(SUM(CASE WHEN date = ${today} THEN price ELSE 0 END), 0) as todayRevenue
                FROM transactions
                WHERE userId = ${userId}
            `;
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error getting statistics:', error);
        throw error;
    }
}

async function getMonthlyReport(year, month, userId = null, role = 'client') {
    try {
        const monthStr = `${year}-${month.padStart(2, '0')}`;
        
        let result;
        if (role === 'admin') {
            result = await sql`
                SELECT * FROM transactions 
                WHERE date LIKE ${monthStr + '%'}
                ORDER BY date DESC, time DESC
            `;
        } else {
            result = await sql`
                SELECT * FROM transactions 
                WHERE date LIKE ${monthStr + '%'} AND userId = ${userId}
                ORDER BY date DESC, time DESC
            `;
        }
        return result.rows;
    } catch (error) {
        console.error('Error getting monthly report:', error);
        throw error;
    }
}

module.exports = {
    initializeDatabase,
    hashPassword,
    findUserByCredentials,
    findUserByToken,
    createSession,
    deleteSession,
    getAllUsers,
    createUser,
    deleteUser,
    changePassword,
    getTransactions,
    createTransaction,
    findTransactionById,
    updateTransaction,
    deleteTransaction,
    getStatistics,
    getMonthlyReport
};
