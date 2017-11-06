const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');

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
	database: 'mangos',
	port: 8889
})

// pool.getConnection(function(err, connection) {
// 	console.log("This is the connection");
// 	connection.release();
// })

// pool.on('acquire', function (connection) {
//   console.log('Connection %d acquired', connection.threadId);
// });

// pool.on('enqueue', function () {
//   console.log('Waiting for available connection slot');
// });

// pool.on('release', function (connection) {
//   console.log('Connection %d released', connection.threadId);
// });


passport.use(new Strategy(credentials, // First argument accepts an object for clientID, clientSecret, and callbackURL
	function (accessToken, refreshToken, profile, cb) {
		let sql = "SELECT * FROM ?? WHERE ?? = ?"
		let inserts = ['users', 'facebookid', profile.id];
		sql = mysql.format(sql, inserts);
		pool.query(sql, function(err, results, fields) {
			debugger
			if (err) throw err;
			console.log("These are the results", results);
			if (results.length == 0) {
				let { displayName, id } = profile;
				let sql = "INSERT INTO ??(??, ??) VALUES (?, ?)";
				let inserts = ['users', 'facebookid', 'displayName', id, displayName];
				sql = mysql.format(sql, inserts);
				pool.query(sql, function(err, results, fields) {
					if (err) throw err;
					console.log("This is the new id: ", results.insertId);
				});
			}
		})
		return cb(null, profile);
	}));


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


app.get('/',
	function(req, res) {
		res.sendFile(path.resolve('client', 'index.html'));
	}
);

app.get('/luigi',
	function(req, res) {
		res.sendFile(path.resolve('client', 'success.html'));
	}
);

app.get('/login/facebook',
	passport.authenticate('facebook')
);

app.get('/login/facebook/return', 
	passport.authenticate('facebook', { failureRedirect: '/' }),
	function(req, res) {
		res.redirect('/luigi');
	}
);

app.get('/logout',
	function(req, res){
		req.logout();
		res.redirect('/');
	}
);


app.listen(PORT, () => {
	console.log("Server started on PORT", PORT);
})