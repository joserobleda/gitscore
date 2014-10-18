
	var app 	= require('neasy');
	var User 	= require('../controllers/user.js');
	
	app.get('/', User.landing);
	app.post('/', User.hook);