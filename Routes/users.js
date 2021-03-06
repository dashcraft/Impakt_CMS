var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../Models/user'); //Current model for testing passport.

// REGISTER METHOD
router.post('/register', function(req, res){
	var username = req.body.username;
	var password = req.body.password;

	console.log(username);
	console.log(password);
	
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	var errors = req.validationErrors();
	
	if(errors){
		console.log(errors);
		return res.status(500).send({message: "SERVER ERROR"});
	} else {
		User.getUserByUsername(username, function(err, user){
			if (err) {
				throw err; 
			}
			if (user) {
				console.log("USER EXISTS");
				return res.status(404).send({message: "USER EXISTS"});
			}
			if (!user){
				console.log('SUCCESS');
				
				var newUser = new User({
					username: username,
					password: password
				});
				
				User.createUser(newUser, function(err, user){
					if (err) throw err;
					console.log(user);
				});
				return res.status(200).send({message: "USER CREATED"});
			}
		});
	}
});

// START PASSPORT MAGIC
passport.use(new LocalStrategy( 
  function(username, password, done) {
	console.log("new local strategy");
    User.getUserByUsername(username, function(err, user){
   	  if(err) throw err;
   	  if(!user){
		console.log("Unknown User");
   		return done(null, false, {message: 'Unknown User'});
	  }

   	  User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
			console.log("LOGGED IN");
   			return done(null, user);
   		} else {
			console.log("Invalid password");
   			return done(null, false, {message: 'Invalid password'});
   		}
   	  });
    });
  }));
 
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});
//END PASSPORT MAGIC

//LOGIN METHOD
router.post('/login', function(req, res, next){
	passport.authenticate('local', function(err, user, info) {
		if (err) { 
			console.log("SERVER ERROR"); 
			return res.state(500).send({message: "SERVER ERROR"});
		}
		if (!user) { 
			console.log("NO USER FOUND"); 
			return res.status(400).send({message: "NO USER FOUND"}); 
		}
		req.logIn(user, function(err) {
			if (err) { 
				console.log("SERVER ERROR"); 
				return res.state(500).send({message: "SERVER ERROR"});
			}
			console.log("LOGIN SUCCESS");
			return res.json(user);
		});
	})(req, res, next);
});

//LOGOUT METHOD	
router.get('/logout', function(req, res){
	req.logout();
	console.log("LOGGED OUT");
	res.redirect('/');
});

module.exports = router;