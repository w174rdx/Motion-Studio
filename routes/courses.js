// Imports the Express framework
const express = require('express');
const router = express.Router();

// Defines a route to list all courses
router.get('/', (req, res) => {
    // Retrieves the courses database from the app
    const coursesDB = req.app.get('coursesDB');
    coursesDB.find({}, (err, courses) => {
        // Handles database errors
        if (err) return res.status(500).send('Database error');
        // Renders the courses template with course data and user information
        res.render('courses', { 
            courses, 
            user: req.session.user, 
            isOrganiser: req.session.user && req.session.user.role === 'organiser' 
        });
    });
});

// Defines a route to display course details
router.get('/:id', (req, res) => {
    // Retrieves the courses and bookings databases from the app
    const coursesDB = req.app.get('coursesDB');
    const bookingsDB = req.app.get('bookingsDB');
    // Queries the database for a specific course by ID
    coursesDB.findOne({ _id: req.params.id }, (err, course) => {
        // Handles errors or missing courses
        if (err || !course) return res.status(404).send('Course not found');
        
        // Checks if a user is logged in
        if (req.session.user) {
            // Checks if the logged-in user has already booked this course
            bookingsDB.findOne({ courseId: req.params.id, email: req.session.user.email }, (err, existingBooking) => {
                // Handles database errors
                if (err) return res.status(500).send('Database error');
                // Renders the booking status
                res.render('course-details', {
                    course,
                    user: req.session.user,
                    isOrganiser: req.session.user && req.session.user.role === 'organiser',
                    hasBooked: !!existingBooking
                });
            });
        } else {
            // Renders course details for non-logged-in users
            res.render('course-details', {
                course,
                user: req.session.user,
                isOrganiser: req.session.user && req.session.user.role === 'organiser',
                hasBooked: false
            });
        }
    });
});

// Defines a route to handle course booking
router.post('/:id/book', (req, res) => {
    // Extracts name and email from the request body
    const { name, email } = req.body;
    // Retrieves the bookings and courses databases from the app
    const bookingsDB = req.app.get('bookingsDB');
    const coursesDB = req.app.get('coursesDB');

    // Queries the database for the specific course by ID
    coursesDB.findOne({ _id: req.params.id }, (err, course) => {
        // Handles errors or missing courses
        if (err || !course) return res.status(404).send('Course not found');

        // Checks if the email has already booked the course
        bookingsDB.findOne({ courseId: req.params.id, email }, (err, existingBooking) => {
            // Handles database errors
            if (err) return res.status(500).send('Database error');
            // If a booking exists, re-renders the course details with an error message
            if (existingBooking) {
                return res.render('course-details', {
                    course,
                    user: req.session.user,
                    error: 'This email has already booked this course',
                    isOrganiser: req.session.user && req.session.user.role === 'organiser',
                    hasBooked: true
                });
            }

            // Inserts a new booking into the database
            bookingsDB.insert({
                courseId: req.params.id,
                name,
                email,
                bookedAt: new Date()
            }, (err) => {
                // Handles database errors during booking
                if (err) return res.status(500).send('Booking failed');
                // Redirects to the courses page after successful booking
                res.redirect('/courses');
            });
        });
    });
});

// Exports the router for use in the main application
module.exports = router;