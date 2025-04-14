const Datastore = require('nedb');
const bcrypt = require('bcryptjs');
const path = require('path');

console.log('Starting admin user creation script...');

// Initialize the users database
const dbPath = path.join(__dirname, 'data', 'users.db');
console.log('Database path:', dbPath);
const usersDB = new Datastore({ filename: dbPath, autoload: true });

// Admin user details
const adminUser = {
    email: 'admin@example.com',
    password: 'AdminPass123',
    role: 'organiser'
};

console.log('Checking for existing user:', adminUser.email);

// Check if the user already exists
usersDB.findOne({ email: adminUser.email }, (err, existingUser) => {
    if (err) {
        console.error('Error checking database:', err);
        return;
    }
    if (existingUser) {
        console.log('Admin user already exists:', adminUser.email);
        return;
    }

    console.log('No existing user found. Creating new admin...');

    // Hash the password
    const hashedPassword = bcrypt.hashSync(adminUser.password, 10);
    console.log('Password hashed successfully');

    // Insert the admin user
    usersDB.insert({
        email: adminUser.email,
        password: hashedPassword,
        role: adminUser.role
    }, (err, newUser) => {
        if (err) {
            console.error('Error creating admin user:', err);
        } else {
            console.log('Admin user created successfully:', newUser.email);
            console.log('Use these credentials to log in:');
            console.log('Email:', adminUser.email);
            console.log('Password:', adminUser.password);
        }
    });
});

console.log('Script execution initiated. Waiting for database operations...');