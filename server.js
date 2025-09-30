// server.js - COMPLETE FEEDBACK SYSTEM WITH FIXED WEBSOCKET
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const http = require('http'); // Add this
const WebSocket = require('ws'); // Add this
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Initialize Database
const db = new sqlite3.Database('./deakinpay.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables and data
function initializeDatabase() {
    // Create tables if they don't exist
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            student_id TEXT UNIQUE,
            course TEXT,
            semester TEXT,
            status TEXT,
            balance DECIMAL(10,2) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Feedback table
        db.run(`CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            wants_response BOOLEAN DEFAULT 1,
            status TEXT DEFAULT 'New',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Transactions table
        db.run(`CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            transaction_id TEXT UNIQUE,
            description TEXT,
            amount DECIMAL(10,2),
            type TEXT,
            method TEXT,
            status TEXT,
            transaction_date TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Fees table
        db.run(`CREATE TABLE IF NOT EXISTS fees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            description TEXT,
            amount DECIMAL(10,2),
            due_date TEXT,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // User units table
        db.run(`CREATE TABLE IF NOT EXISTS user_units (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            unit_code TEXT,
            unit_name TEXT,
            status TEXT DEFAULT 'Enrolled',
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Notifications table - ADD THIS FOR REAL-TIME NOTIFICATIONS
        db.run(`CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            is_read BOOLEAN DEFAULT 0,
            conditions TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        console.log('✅ Database tables created/verified');
        
        // Insert sample data
        insertSampleData();
    });
}

function insertSampleData() {
    // Check if users already exist to avoid duplicates
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (row.count === 0) {
            console.log('📝 Inserting sample data...');
            
            // Insert sample users
            const users = [
                ['s224967779@deakin.edu.au', 'Deakin2025', 'Valeh Moghaddam', 's224967779', 'Master of Information Technology', 'Trimester 2, 2025', 'Active - Full Time', 7503.00],
                ['demo@deakin.edu.au', 'password123', 'Demo Student', 's123456789', 'Bachelor of Computer Science', 'Trimester 1, 2025', 'Active - Full Time', 6303.00]
            ];

            users.forEach(user => {
                db.run(`INSERT INTO users (email, password, name, student_id, course, semester, status, balance) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, user, function(err) {
                    if (err) {
                        console.error('Error inserting user:', err);
                    } else {
                        const userId = this.lastID;
                        insertUserData(userId, user[0]);
                    }
                });
            });
        }
    });

    // Insert sample feedback
    db.get("SELECT COUNT(*) as count FROM feedback", (err, row) => {
        if (row.count === 0) {
            console.log('💬 Inserting sample feedback...');
            const sampleFeedback = [
                ['John Smith', 'john@deakin.edu.au', 'Great Payment System', 'I love how easy it is to pay my fees through DeakinPay. The interface is user-friendly!', 1],
                ['Sarah Johnson', 'sarah@deakin.edu.au', 'Mobile App Suggestion', 'Would be great to have a mobile app for DeakinPay for on-the-go payments.', 1],
                ['Mike Chen', 'mike@deakin.edu.au', 'Quick Support', 'The support team resolved my payment issue within hours. Excellent service!', 0]
            ];

            sampleFeedback.forEach(feedback => {
                db.run(`INSERT INTO feedback (name, email, subject, message, wants_response) 
                        VALUES (?, ?, ?, ?, ?)`, feedback);
            });
        }
    });

    // Insert sample notifications
    db.get("SELECT COUNT(*) as count FROM notifications", (err, row) => {
        if (row.count === 0) {
            console.log('🔔 Inserting sample notifications...');
            const sampleNotifications = [
                [1, 'Payment Reminder', 'Your trimester fees are due in 7 days', 'warning', 0, '{"due_soon": true}'],
                [1, 'Welcome to DeakinPay', 'Get started with our secure payment system', 'info', 0, '{"new_user": true}'],
                [2, 'System Update', 'New features added to the payment portal', 'info', 0, '{"all_users": true}']
            ];

            sampleNotifications.forEach(notification => {
                db.run(`INSERT INTO notifications (user_id, title, message, type, is_read, conditions) 
                        VALUES (?, ?, ?, ?, ?, ?)`, notification);
            });
        }
    });
}

function insertUserData(userId, email) {
    if (email === 's224967779@deakin.edu.au') {
        // Insert units, fees, transactions (same as before)
        const units = [
            [userId, 'SIT774', 'SIT774 - Applied Software Engineering'],
            [userId, 'SIT722', 'SIT722 - Software Deployment and Operation'],
            [userId, 'SIT753', 'SIT753 - Professional Practice in IT']
        ];

        units.forEach(unit => {
            db.run('INSERT OR IGNORE INTO user_units (user_id, unit_code, unit_name) VALUES (?, ?, ?)', unit);
        });

        const fees = [
            [userId, 'Tuition Fee (3 units)', 7200.00, '15/10/2025', 'Pending'],
            [userId, 'Student Services Fee', 303.00, '15/10/2025', 'Pending']
        ];

        fees.forEach(fee => {
            db.run('INSERT OR IGNORE INTO fees (user_id, description, amount, due_date, status) VALUES (?, ?, ?, ?, ?)', fee);
        });

        const transactions = [
            [userId, 'DKN20250301', 'Library Fee', 125.00, 'payment', 'Credit Card', 'Completed', '01/03/2025'],
            [userId, 'DKN20250215', 'Student Services', 303.00, 'payment', 'PayPal', 'Completed', '15/02/2025'],
            [userId, 'DKN20250110', 'Tuition Payment', 3600.00, 'payment', 'Bank Transfer', 'Completed', '10/01/2025'],
            [userId, 'DKN20241205', 'Late Fee Refund', -50.00, 'refund', 'Bank Transfer', 'Completed', '05/12/2024']
        ];

        transactions.forEach(trans => {
            db.run(`INSERT OR IGNORE INTO transactions (user_id, transaction_id, description, amount, type, method, status, transaction_date) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, trans);
        });
    }
}

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/support.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'support.html'));
});

// REAL DATABASE APIs

// Login API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log('🔐 Login attempt:', email);
    
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
        
        if (user && user.password === password) {
            // Get complete user data
            getCompleteUserData(user.id)
                .then(completeUser => {
                    console.log('✅ Login successful for:', email);
                    res.json({ 
                        success: true, 
                        user: completeUser 
                    });
                })
                .catch(error => {
                    console.error('Error getting user data:', error);
                    res.status(500).json({ success: false, error: 'Error loading user data' });
                });
        } else {
            console.log('❌ Login failed for:', email);
            res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
    });
});

// Get complete user data with related records
function getCompleteUserData(userId) {
    return new Promise((resolve, reject) => {
        // Get user basic info
        db.get(`SELECT id, email, name, student_id, course, semester, status, balance 
                FROM users WHERE id = ?`, [userId], (err, user) => {
            if (err) {
                reject(err);
                return;
            }

            if (!user) {
                resolve(null);
                return;
            }

            // Get user units
            db.all(`SELECT unit_name FROM user_units WHERE user_id = ?`, [userId], (err, unitRows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const units = unitRows.map(row => row.unit_name);

                // Get user fees
                db.all(`SELECT description, amount, due_date as dueDate, status 
                        FROM fees WHERE user_id = ?`, [userId], (err, feeRows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const fees = feeRows;

                    // Get user transactions
                    db.all(`SELECT transaction_id as id, transaction_date as date, description, amount, type, method, status 
                            FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC`, [userId], (err, transRows) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        const transactions = transRows;

                        // Get user notifications
                        db.all(`SELECT id, title, message, type, is_read, created_at 
                                FROM notifications WHERE user_id = ? OR conditions LIKE '%"all_users": true%' 
                                ORDER BY created_at DESC LIMIT 10`, [userId], (err, notificationRows) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            const notifications = notificationRows;

                            resolve({
                                ...user,
                                units,
                                fees,
                                transactions,
                                notifications
                            });
                        });
                    });
                });
            });
        });
    });
}

// FEEDBACK APIs - COMPLETE CRUD
app.post('/api/feedback', (req, res) => {
    const { name, email, subject, message, wants_response } = req.body;
    
    console.log('📝 Saving feedback:', { name, email, subject });
    
    db.run(`INSERT INTO feedback (name, email, subject, message, wants_response) 
            VALUES (?, ?, ?, ?, ?)`, 
            [name, email, subject, message, wants_response ? 1 : 0], 
            function(err) {
        if (err) {
            console.error('❌ Error saving feedback:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
        
        console.log('✅ Feedback saved with ID:', this.lastID);
        res.json({ success: true, id: this.lastID });
    });
});

// Get all feedback
app.get('/api/feedback', (req, res) => {
    db.all(`SELECT * FROM feedback ORDER BY created_at DESC`, (err, rows) => {
        if (err) {
            console.error('Error fetching feedback:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
        console.log(`📊 Retrieved ${rows.length} feedback entries`);
        res.json(rows);
    });
});

// Get recent feedback for display (limited to 5)
app.get('/api/feedback/recent', (req, res) => {
    db.all(`SELECT name, subject, message, created_at 
            FROM feedback 
            ORDER BY created_at DESC 
            LIMIT 5`, (err, rows) => {
        if (err) {
            console.error('Error fetching recent feedback:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
        res.json(rows);
    });
});

// Update feedback status
app.put('/api/feedback/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    db.run(`UPDATE feedback SET status = ? WHERE id = ?`, [status, id], function(err) {
        if (err) {
            console.error('Error updating feedback:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
        res.json({ success: true, changes: this.changes });
    });
});

// Delete feedback
app.delete('/api/feedback/:id', (req, res) => {
    const { id } = req.params;
    
    db.run(`DELETE FROM feedback WHERE id = ?`, [id], function(err) {
        if (err) {
            console.error('Error deleting feedback:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
        res.json({ success: true, changes: this.changes });
    });
});

// NOTIFICATION APIs - NEW REAL-TIME FEATURES
app.get('/api/user/:userId/notifications', (req, res) => {
    const { userId } = req.params;
    
    db.all(`SELECT id, title, message, type, is_read, created_at 
            FROM notifications 
            WHERE user_id = ? OR conditions LIKE '%"all_users": true%'
            ORDER BY created_at DESC`, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching notifications:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
        res.json(rows);
    });
});

app.put('/api/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    
    db.run(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id], function(err) {
        if (err) {
            console.error('Error updating notification:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
        res.json({ success: true, changes: this.changes });
    });
});

// Create notification with conditions
app.post('/api/notifications', (req, res) => {
    const { userId, title, message, type, conditions } = req.body;
    
    db.run(`INSERT INTO notifications (user_id, title, message, type, conditions) 
            VALUES (?, ?, ?, ?, ?)`, 
            [userId, title, message, type, JSON.stringify(conditions)], 
            function(err) {
        if (err) {
            console.error('Error creating notification:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
        
        // Send real-time notification to connected clients
        if (wss) {
            sendUserNotification(userId, {
                type: 'new_notification',
                notification: {
                    id: this.lastID,
                    title,
                    message,
                    type,
                    created_at: new Date().toISOString()
                }
            });
        }
        
        res.json({ success: true, id: this.lastID });
    });
});

// User data APIs
app.get('/api/user/:userId/transactions', (req, res) => {
    const { userId } = req.params;
    
    db.all(`SELECT transaction_id as id, transaction_date as date, description, amount, type, method, status 
            FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC`, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
        res.json(rows);
    });
});

app.get('/api/user/:userId/fees', (req, res) => {
    const { userId } = req.params;
    
    db.all(`SELECT description, amount, due_date as dueDate, status 
            FROM fees WHERE user_id = ?`, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching fees:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
        res.json(rows);
    });
});

// Health check
app.get('/api/health', (req, res) => {
    db.get("SELECT COUNT(*) as userCount FROM users", (err, userRow) => {
        db.get("SELECT COUNT(*) as feedbackCount FROM feedback", (err, feedbackRow) => {
            res.json({ 
                status: 'OK', 
                message: 'DeakinPay API with Database is running',
                database: 'SQLite connected',
                users: userRow.userCount,
                feedback: feedbackRow.feedbackCount
            });
        });
    });
});

// Create HTTP server first
const server = http.createServer(app);

// THEN initialize WebSocket server
let wss = null;
try {
    wss = new WebSocket.Server({ server });
    console.log('🔔 WebSocket server initialized for real-time notifications');
    
    // Store connected clients
    const clients = new Map();
    
    wss.on('connection', (ws, req) => {
        console.log('🔌 New WebSocket connection');
        
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                
                if (data.type === 'authenticate' && data.userId) {
                    // Store user connection
                    clients.set(data.userId, ws);
                    ws.userId = data.userId;
                    console.log(`✅ User ${data.userId} connected to WebSocket`);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });
        
        ws.on('close', () => {
            if (ws.userId) {
                clients.delete(ws.userId);
                console.log(`❌ User ${ws.userId} disconnected from WebSocket`);
            }
        });
    });
    
    // Function to send notifications to specific users
    function sendUserNotification(userId, message) {
        const client = clients.get(userId.toString());
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
            console.log(`📨 Sent notification to user ${userId}`);
        }
    }
    
    // Make function available globally
    global.sendUserNotification = sendUserNotification;
    
} catch (error) {
    console.log('⚠️ WebSocket server not available (might be in test environment)');
}

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 DeakinPay Server with REAL-TIME NOTIFICATIONS running at: http://localhost:${PORT}`);
    console.log(`📊 Using SQLite database: deakinpay.db`);
    console.log(`💬 Feedback system: ACTIVE`);
    console.log(`🔔 Real-time notifications: ${wss ? 'ACTIVE' : 'DISABLED'}`);
    console.log(`📧 Test Accounts:`);
    console.log(`   s224967779@deakin.edu.au / Deakin2025`);
    console.log(`   demo@deakin.edu.au / password123`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Closing database connection...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});