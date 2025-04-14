const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Home page
router.get('/', (req, res) => {
    res.render('home', { user: req.session.user, error: req.query.error, isOrganiser: req.session.user && req.session.user.role === 'organiser' });
});

// About page
router.get('/about', (req, res) => {
    res.render('about', { user: req.session.user, isOrganiser: req.session.user && req.session.user.role === 'organiser' });
});

// Login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/organiser/dashboard');
    }
    res.render('login', { user: req.session.user, isOrganiser: req.session.user && req.session.user.role === 'organiser' });
});

// Handle login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const usersDB = req.app.get('usersDB');

    usersDB.findOne({ email }, (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.render('login', { error: 'Invalid credentials', user: req.session.user, isOrganiser: req.session.user && req.session.user.role === 'organiser' });
        }
        req.session.user = user;
        res.redirect('/organiser/dashboard');
    });
});

// Register page
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/organiser/dashboard');
    }
    res.render('register', { user: req.session.user, isOrganiser: req.session.user && req.session.user.role === 'organiser' });
});

// Handle registration
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const usersDB = req.app.get('usersDB');

    usersDB.findOne({ email }, (err, existingUser) => {
        if (err) {
            return res.render('register', { error: 'Database error', user: req.session.user, isOrganiser: req.session.user && req.session.user.role === 'organiser' });
        }
        if (existingUser) {
            return res.render('register', { error: 'Email already registered', user: req.session.user, isOrganiser: req.session.user && req.session.user.role === 'organiser' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        usersDB.insert({
            name,
            email,
            password: hashedPassword,
            role: 'user'
        }, (err, newUser) => {
            if (err) {
                return res.render('register', { error: 'Failed to register', user: req.session.user, isOrganiser: req.session.user && req.session.user.role === 'organiser' });
            }
            res.render('register', { success: 'Registration successful! Please log in.', user: req.session.user, isOrganiser: req.session.user && req.session.user.role === 'organiser' });
        });
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;