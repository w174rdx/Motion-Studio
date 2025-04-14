const express = require('express');
const router = express.Router();

// List all courses
router.get('/', (req, res) => {
    const coursesDB = req.app.get('coursesDB');
    coursesDB.find({}, (err, courses) => {
        if (err) return res.status(500).send('Database error');
        res.render('courses', { courses, user: req.session.user, isOrganiser: req.session.user && req.session.user.role === 'organiser' });
    });
});

// Course details
router.get('/:id', (req, res) => {
    const coursesDB = req.app.get('coursesDB');
    const bookingsDB = req.app.get('bookingsDB');
    coursesDB.findOne({ _id: req.params.id }, (err, course) => {
        if (err || !course) return res.status(404).send('Course not found');
        
        // Check if the logged-in user's email has already booked this course
        if (req.session.user) {
            bookingsDB.findOne({ courseId: req.params.id, email: req.session.user.email }, (err, existingBooking) => {
                if (err) return res.status(500).send('Database error');
                res.render('course-details', {
                    course,
                    user: req.session.user,
                    isOrganiser: req.session.user && req.session.user.role === 'organiser',
                    hasBooked: !!existingBooking // true if the user has booked, false otherwise
                });
            });
        } else {
            // No user logged in, render without checking bookings
            res.render('course-details', {
                course,
                user: req.session.user,
                isOrganiser: req.session.user && req.session.user.role === 'organiser',
                hasBooked: false
            });
        }
    });
});

// Book a course
router.post('/:id/book', (req, res) => {
    const { name, email } = req.body;
    const bookingsDB = req.app.get('bookingsDB');
    const coursesDB = req.app.get('coursesDB');

    coursesDB.findOne({ _id: req.params.id }, (err, course) => {
        if (err || !course) return res.status(404).send('Course not found');

        bookingsDB.findOne({ courseId: req.params.id, email }, (err, existingBooking) => {
            if (err) return res.status(500).send('Database error');
            if (existingBooking) {
                return res.render('course-details', {
                    course,
                    user: req.session.user,
                    error: 'This email has already booked this course',
                    isOrganiser: req.session.user && req.session.user.role === 'organiser',
                    hasBooked: true // Ensure hasBooked is true if re-rendered after a failed booking attempt
                });
            }

            bookingsDB.insert({
                courseId: req.params.id,
                name,
                email,
                bookedAt: new Date()
            }, (err) => {
                if (err) return res.status(500).send('Booking failed');
                res.redirect('/courses');
            });
        });
    });
});

module.exports = router;