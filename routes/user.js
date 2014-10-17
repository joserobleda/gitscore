
	var app 	= require('neasy');
	var User 	= require('../controllers/user.js');
	
	app.get('/', User.hook);
	app.post('/', User.hook);