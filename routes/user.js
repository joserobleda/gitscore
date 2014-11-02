
	var app 	= require('neasy');
	var User 	= require('../controllers/user.js');

	app.get('/', User.landing);
	app.get('/:owner/:repo', User.repo);
	app.get('/:owner/:repo/:user', User.userInRepo);
	app.post('/', User.hook);