const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware to check if user is an organiser
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    if (req.session.user.role !== 'organiser') {
        return res.redirect('/?error=Access denied: Organiser privileges required');
    }
    next();
};

// Organiser dashboard
router.get('/dashboard', isAuthenticated, (req, res) => {
    const coursesDB = req.app.get('coursesDB');
    const usersDB = req.app.get('usersDB');
    coursesDB.find({}, (err, courses) => {
        if (err) return res.status(500).send('Database error');
        usersDB.find({ role: 'organiser' }, (err, organisers) => {
            if (err) return res.status(500).send('Database error');
            res.render('organiser-dashboard', {
                courses,
                user: req.session.user,
                error: req.query.error,
                isOrganiser: req.session.user && req.session.user.role === 'organiser',
                organisers
            });
        });
    });
});

// Add new course
router.get('/add', isAuthenticated, (req, res) => {
    res.render('add-course', {
        user: req.session.user,
        isOrganiser: req.session.user && req.session.user.role === 'organiser'
    });
});

router.post('/add', isAuthenticated, upload.single('picture'), (req, res) => {
    const { name, duration, classes } = req.body;
    const picture = req.file ? `/uploads/${req.file.filename}` : null;
    const coursesDB = req.app.get('coursesDB');
    
    if (!name || !duration || !classes || !Array.isArray(classes) || classes.length === 0) {
        return res.render('add-course', { user: req.session.user, error: 'All fields are required, including at least one class', isOrganiser: req.session.user && req.session.user.role === 'organiser' });
    }
    
    const classesArray = Array.isArray(classes) ? classes : [classes];
    const cleanedClasses = classesArray.map(cls => ({
        date: cls.date,
        time: cls.time,
        description: cls.description,
        location: cls.location,
        price: cls.price
    }));

    coursesDB.insert({
        name,
        duration,
        picture,
        classes: cleanedClasses,
        createdAt: new Date()
    }, (err) => {
        if (err) return res.status(500).send('Failed to add course');
        res.redirect('/organiser/dashboard');
    });
});

// Edit course
router.get('/edit/:id', isAuthenticated, (req, res) => {
    const coursesDB = req.app.get('coursesDB');
    coursesDB.findOne({ _id: req.params.id }, (err, course) => {
        if (err || !course) return res.status(404).send('Course not found');
        res.render('edit-course', {
            course,
            user: req.session.user,
            isOrganiser: req.session.user && req.session.user.role === 'organiser'
        });
    });
});

router.post('/edit/:id', isAuthenticated, upload.single('picture'), (req, res) => {
    const { name, duration, classes } = req.body;
    const picture = req.file ? `/uploads/${req.file.filename}` : req.body.existingPicture;
    const coursesDB = req.app.get('coursesDB');
    
    const classesArray = Array.isArray(classes) ? classes : [classes];
    const cleanedClasses = classesArray.map(cls => ({
        date: cls.date,
        time: cls.time,
        description: cls.description,
        location: cls.location,
        price: cls.price
    }));

    coursesDB.update({ _id: req.params.id }, {
        $set: { name, duration, picture, classes: cleanedClasses, updatedAt: new Date() }
    }, {}, (err) => {
        if (err) return res.status(500).send('Failed to update course');
        res.redirect('/organiser/dashboard');
    });
});

// Delete course
router.post('/delete/:id', isAuthenticated, (req, res) => {
    const coursesDB = req.app.get('coursesDB');
    const bookingsDB = req.app.get('bookingsDB');
    coursesDB.remove({ _id: req.params.id }, {}, (err) => {
        if (err) return res.status(500).send('Failed to delete course');
        bookingsDB.remove({ courseId: req.params.id }, { multi: true }, () => {
            res.redirect('/organiser/dashboard');
        });
    });
});

// Class list
router.get('/class-list/:id', isAuthenticated, (req, res) => {
    const bookingsDB = req.app.get('bookingsDB');
    const coursesDB = req.app.get('coursesDB');
    coursesDB.findOne({ _id: req.params.id }, (err, course) => {
        if (err || !course) return res.status(404).send('Course not found');
        bookingsDB.find({ courseId: req.params.id }, (err, bookings) => {
            if (err) return res.status(500).send('Database error');
            res.render('class-list', {
                course,
                bookings,
                user: req.session.user,
                isOrganiser: req.session.user && req.session.user.role === 'organiser'
            });
        });
    });
});

// Add organiser
router.post('/add-user', isAuthenticated, (req, res) => {
    const { email, password } = req.body;
    const usersDB = req.app.get('usersDB');

    usersDB.findOne({ email }, (err, user) => {
        if (user) return res.status(400).send('User already exists');
        const hashedPassword = bcrypt.hashSync(password, 10);
        usersDB.insert({ email, password: hashedPassword, role: 'organiser' }, (err) => {
            if (err) return res.status(500).send('Failed to add organiser');
            res.redirect('/organiser/dashboard?success=Organiser added successfully');
        });
    });
});

// Remove organiser
router.post('/remove-organiser', isAuthenticated, (req, res) => {
    const emailToRemove = req.body.email;
    const usersDB = req.app.get('usersDB');

    // Prevent users from removing themselves
    if (emailToRemove === req.session.user.email) {
        return res.redirect('/organiser/dashboard?error=Cannot remove yourself');
    }

    usersDB.remove({ email: emailToRemove, role: 'organiser' }, {}, (err) => {
        if (err) return res.status(500).send('Failed to remove organiser');
        res.redirect('/organiser/dashboard?success=Organiser removed successfully');
    });
});

module.exports = router;