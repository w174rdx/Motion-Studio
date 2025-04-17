const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const Datastore = require('nedb');

// Initialize Express app
const app = express();
const port = 3000;

// Set up Mustache as the view engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'dance-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Initialise NeDB databases
const usersDB = new Datastore({ filename: 'data/users.db', autoload: true });
const coursesDB = new Datastore({ filename: 'data/courses.db', autoload: true });
const bookingsDB = new Datastore({ filename: 'data/bookings.db', autoload: true });

// Make databases accessible in routes
app.set('usersDB', usersDB);
app.set('coursesDB', coursesDB);
app.set('bookingsDB', bookingsDB);

// Routes
const indexRoutes = require('./routes/index');
const courseRoutes = require('./routes/courses');
const organiserRoutes = require('./routes/organiser');

app.use('/', indexRoutes);
app.use('/courses', courseRoutes);
app.use('/organiser', organiserRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`); // Should display message if running
});