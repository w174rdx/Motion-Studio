const express = require('express');
const router = express.Router();
// Imports bcrypt for password hashing
const bcrypt = require('bcryptjs');
// Imports multer for handling file uploads
const multer = require('multer');
const path = require('path');

// Configures multer for file uploads
// Reference: https://www.npmjs.com/package/multer
const storage = multer.diskStorage({
    // Specifies the destination folder for uploaded files
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    // Generates a unique filename
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
// Initialises multer with the defined storage configuration
const upload = multer({ storage: storage });

// Middleware to verify if the user is an authenticated organiser
const isAuthenticated = (req, res, next) => {
    // Redirects to login if no user is logged in
    if (!req.session.user) {
        return res.redirect('/login');
    }
    // Redirects with an error if the user is not an organiser
    if (req.session.user.role !== 'organiser') {
        return res.redirect('/?error=Access denied: Organiser privileges required');
    }
    // Proceeds to the next middleware or route handler
    next();
};

// Defines the organiser dashboard route
router.get('/dashboard', isAuthenticated, (req, res) => {
    // Retrieves the courses and users databases
    const coursesDB = req.app.get('coursesDB');
    const usersDB = req.app.get('usersDB');
    // Queries all courses from the database
    coursesDB.find({}, (err, courses) => {
        // Handles database errors
        if (err) return res.status(500).send('Database error');
        // Queries all organisers from the database
        usersDB.find({ role: 'organiser' }, (err, organisers) => {
            // Handles database errors
            if (err) return res.status(500).send('Database error');
            // Renders the organiser dashboard with course and organiser data
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

// Defines the route to display the add course form
router.get('/add', isAuthenticated, (req, res) => {
    // Renders the add course template
    res.render('add-course', {
        user: req.session.user,
        isOrganiser: req.session.user && req.session.user.role === 'organiser'
    });
});

// Handles the submission of a new course with file upload
router.post('/add', isAuthenticated, upload.single('picture'), (req, res) => {
    // Extracts course details from the request body
    const { name, duration, classes } = req.body;
    // Sets the picture path if a file was uploaded
    const picture = req.file ? `/uploads/${req.file.filename}` : null;
    // Retrieves the courses database
    const coursesDB = req.app.get('coursesDB');
    
    // Validates that all required fields are provided
    if (!name || !duration || !classes || !Array.isArray(classes) || classes.length === 0) {
        // Re-renders the add course form with an error message if validation fails
        return res.render('add-course', { 
            user: req.session.user, 
            error: 'All fields are required, including at least one class', 
            isOrganiser: req.session.user && req.session.user.role === 'organiser' 
        });
    }
    
    // Ensures classes is an array
    const classesArray = Array.isArray(classes) ? classes : [classes];
    // Cleans and formats the class data
    const cleanedClasses = classesArray.map(cls => ({
        date: cls.date || '',
        time: cls.time || '',
        description: cls.description || '',
        location: cls.location || '',
        price: cls.price || ''
    }));

    // Inserts the new course into the database
    coursesDB.insert({
        name,
        duration,
        picture,
        classes: cleanedClasses,
        createdAt: new Date()
    }, (err) => {
        // Handles database errors
        if (err) return res.status(500).send('Failed to add course');
        // Redirects to the organiser dashboard
        res.redirect('/organiser/dashboard');
    });
});

// Defines the route to display the edit course form
router.get('/edit/:id', isAuthenticated, (req, res) => {
    // Retrieves the courses database
    const coursesDB = req.app.get('coursesDB');
    // Extracts the course ID from the URL parameters
    const courseId = req.params.id;
    // Logs the attempt to fetch the course
    console.log(`Attempting to fetch course with ID: ${courseId}`);

    // Ensures the database is loaded
    coursesDB.loadDatabase(err => {
        // Handles database loading errors
        if (err) {
            console.error('Error loading database:', err);
            return res.status(500).send('Error loading database');
        }

        // Queries the database for the specific course
        coursesDB.findOne({ _id: courseId }, (err, course) => {
            // Handles database query errors
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).send('Database query error');
            }
            // Handles cases where the course is not found
            if (!course) {
                console.log(`Course with ID ${courseId} not found`);
                // Logs all course IDs for debugging
                coursesDB.find({}, (err, allCourses) => {
                    if (err) {
                        console.error('Error fetching all courses:', err);
                    } else {
                        const courseIds = allCourses.map(c => c._id);
                        console.log('All course IDs in database:', courseIds);
                    }
                    return res.status(404).send('Course not found');
                });
                return;
            }
            // Logs the found course
            console.log(`Course found: ${JSON.stringify(course)}`);
            // Renders the edit course template with course data
            res.render('edit-course', {
                course,
                user: req.session.user,
                isOrganiser: req.session.user && req.session.user.role === 'organiser'
            });
        });
    });
});

// Handles the submission of the edited course
router.post('/edit/:id', isAuthenticated, (req, res) => {
    // Logs the edit course request
    console.log(`POST /organiser/edit/${req.params.id} reached`);
    console.log('Request body:', req.body);

    // Extracts course details from the request body
    const { name, duration, classes } = req.body;
    // Retrieves the courses database
    const coursesDB = req.app.get('coursesDB');

    // Initialises an array for classes
    let classesArray = [];
    // Handles classes provided as a JSON string
    if (typeof classes === 'string') {
        try {
            classesArray = JSON.parse(classes);
        } catch (e) {
            console.error('Error parsing classes string:', e);
            // Re-renders the edit form with an error if parsing fails
            return res.render('edit-course', {
                course: req.body,
                user: req.session.user,
                error: 'Invalid class data format',
                isOrganiser: req.session.user && req.session.user.role === 'organiser'
            });
        }
    } else if (Array.isArray(classes)) {
        // Handles classes provided as an array
        classesArray = classes;
    } else if (typeof classes === 'object' && classes !== null) {
        // Handles classes provided as an object
        classesArray = Object.values(classes).filter(cls => 
            cls.date && cls.time && cls.description && cls.location && cls.price
        );
    } else {
        classesArray = [];
    }

    // Logs the parsed classes array
    console.log('Parsed classesArray (edit):', classesArray);

    // Validates that all required fields are provided
    if (!name || !duration || classesArray.length === 0) {
        console.log('Validation failed (edit) - Missing fields:', { name, duration, classesArray });
        // Re-renders the edit form with an error if validation fails
        return res.render('edit-course', {
            course: req.body,
            user: req.session.user,
            error: 'All fields are required, including at least one class',
            isOrganiser: req.session.user && req.session.user.role === 'organiser'
        });
    }

    // Cleans and formats the class data
    const cleanedClasses = classesArray.map(cls => ({
        date: cls.date || '',
        time: cls.time || '',
        description: cls.description || '',
        location: cls.location || '',
        price: cls.price || ''
    }));

    // Logs the cleaned classes
    console.log('Cleaned classes (edit):', cleanedClasses);

    // Updates the course in the database
    coursesDB.update({ _id: req.params.id }, {
        $set: { name, duration, classes: cleanedClasses, updatedAt: new Date() }
    }, {}, (err) => {
        // Handles database update errors
        if (err) {
            console.error('Database update error:', err);
            return res.status(500).send('Failed to update course');
        }
        // Logs successful update
        console.log('Course updated successfully');
        // Redirects to the organiser dashboard
        res.redirect('/organiser/dashboard');
    });
});

// Defines the route to delete a course
router.post('/delete/:id', isAuthenticated, (req, res) => {
    // Retrieves the courses and bookings databases
    const coursesDB = req.app.get('coursesDB');
    const bookingsDB = req.app.get('bookingsDB');
    // Removes the specified course from the database
    coursesDB.remove({ _id: req.params.id }, {}, (err) => {
        // Handles database errors
        if (err) return res.status(500).send('Failed to delete course');
        // Removes all bookings associated with the course
        bookingsDB.remove({ courseId: req.params.id }, { multi: true }, () => {
            // Redirects to the organiser dashboard
            res.redirect('/organiser/dashboard');
        });
    });
});

// Defines the route to display the class list for a course
router.get('/class-list/:id', isAuthenticated, (req, res) => {
    // Retrieves the bookings and courses databases
    const bookingsDB = req.app.get('bookingsDB');
    const coursesDB = req.app.get('coursesDB');
    // Queries the database for the specific course
    coursesDB.findOne({ _id: req.params.id }, (err, course) => {
        // Handles database errors
        if (err) return res.status(500).send('Database error');
        // Handles missing courses
        if (!course) return res.status(404).send('Course not found');
        // Queries all bookings for the course
        bookingsDB.find({ courseId: req.params.id }, (err, bookings) => {
            // Handles database errors
            if (err) return res.status(500).send('Database error');
            // Renders the class list template with course and booking data
            res.render('class-list', {
                course,
                bookings,
                courseId: req.params.id, // Pass courseId explicitly
                user: req.session.user,
                isOrganiser: req.session.user && req.session.user.role === 'organiser'
            });
        });
    });
});

// Defines the route to remove a participant from a course
router.post('/remove-participant/:courseId/:bookingId', isAuthenticated, (req, res) => {
    // Logs the remove participant request
    console.log(`POST /organiser/remove-participant/${req.params.courseId}/${req.params.bookingId} reached`);
    // Retrieves the bookings database
    const bookingsDB = req.app.get('bookingsDB');
    // Extracts course and booking IDs from the URL parameters
    const courseId = req.params.courseId;
    const bookingId = req.params.bookingId;

    // Removes the specified booking from the database
    bookingsDB.remove({ _id: bookingId, courseId: courseId }, {}, (err) => {
        // Handles database errors
        if (err) {
            console.error('Error removing participant:', err);
            return res.status(500).send('Failed to remove participant');
        }
        // Redirects to the class list for the course
        res.redirect(`/organiser/class-list/${courseId}`);
    });
});

// Defines the route to add a new organiser
router.post('/add-user', isAuthenticated, (req, res) => {
    // Extracts email and password from the request body
    const { email, password } = req.body;
    // Retrieves the users database
    const usersDB = req.app.get('usersDB');

    // Checks if the email already exists
    usersDB.findOne({ email }, (err, user) => {
        // Handles existing user errors
        if (user) return res.status(400).send('User already exists');
        // Hashes the password
        const hashedPassword = bcrypt.hashSync(password, 10);
        // Inserts the new organiser into the database
        usersDB.insert({ email, password: hashedPassword, role: 'organiser' }, (err) => {
            // Handles database errors
            if (err) return res.status(500).send('Failed to add organiser');
            // Redirects to the dashboard with a success message
            res.redirect('/organiser/dashboard?success=Organiser added successfully');
        });
    });
});

// Defines the route to remove an organiser
router.post('/remove-organiser', isAuthenticated, (req, res) => {
    // Extracts the email to remove from the request body
    const emailToRemove = req.body.email;
    // Retrieves the users database
    const usersDB = req.app.get('usersDB');

    // Prevents users from removing themselves
    if (emailToRemove === req.session.user.email) {
        // Redirects with an error message
        return res.redirect('/organiser/dashboard?error=Cannot remove yourself');
    }

    // Removes the specified organiser from the database
    usersDB.remove({ email: emailToRemove, role: 'organiser' }, {}, (err) => {
        // Handles database errors
        if (err) return res.status(500).send('Failed to remove organiser');
        // Redirects to the dashboard with a success message
        res.redirect('/organiser/dashboard?success=Organiser removed successfully');
    });
});

// Exports the router for use in the main application
module.exports = router;