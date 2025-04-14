const Datastore = require('nedb');
const bcrypt = require('bcryptjs');

const usersDB = new Datastore({ filename: 'data/users.db', autoload: true });
usersDB.insert({
    email: 'organiser@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'organiser'
}, (err) => {
    if (err) console.error(err);
    else console.log('Sample organiser added');
});