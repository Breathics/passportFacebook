const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 8000;

const passport = require('passport');
const Strategy = require('passport-facebook');
const credentials = require('./facebookCreds.js');

const pool = mysql.createPool({
	connectionLimit: 10,
	host: 'localhost',
	user: 'root',
	password: 'root',
	port: 8889
})

pool.getConnection(function(err, connection) {
	console.log("This is the connection");
	connection.release();
})

pool.on('acquire', function (connection) {
  console.log('Connection %d acquired', connection.threadId);
});

pool.on('enqueue', function () {
  console.log('Waiting for available connection slot');
});

pool.on('release', function (connection) {
  console.log('Connection %d released', connection.threadId);
});


passport.use(new Strategy(credentials, // First argument accepts an object for clientID, clientSecret, and callbackURL
	function (accessToken, refreshToken, profile, cb) {
		// In this example, the user's Facebook profile is supplied as the user
		// record.  In a production-quality application, the Facebook profile should
		// be associated with a user record in the application's database, which
		// allows for account linking and authentication with other identity
		// providers.
		return cb(null, profile);
	}));


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/',
	function(req, res) {
		res.sendFile(path.resolve('client', 'index.html'));
	}
);

app.get('/login/facebook',
	passport.authenticate('facebook')
);

app.get('/login/facebook/return', 
	passport.authenticate('facebook', { failureRedirect: '/login' }),
	function(req, res) {
		res.redirect('/');
	}
);


app.listen(PORT, () => {
	console.log("Server started on PORT", PORT);
})