
	var User = require('../models/user');
	var PullRequest = require('../models/pull');


	module.exports = {

		/***
		   * Hooks here
		   *
		   */
		landing: function (req, res, next) {
			return res.end('200 OK');
		},

		/***
		   * Hooks here
		   *
		   */
		hook: function (req, res, next) {
			if (req.body.action !== 'assigned') {
				return res.end();
			}

			var pull 		= req.body.pull_request;
			var creator 	= pull.user;
			var assignee 	= pull.assignee;

			console.log("creator: " + creator.login);

			if (assignee) {
				console.log("assignee: " + assignee.login);
			} else {
				console.log("no assignee");
			}

			PullRequest.findOrCreate({id: pull.id}, pull).then(function (pull) {
				var bounces;

				if (undefined === (bounces = pull.get('bounces'))) {
					bounces = 0;
				}

				var update = {
					'bounces': bounces + 1,
					'updated_at', pull.updated_at
				};

				pull.set(update).save().then(function () {
					console.log('bounces: ' + pull.get('bounces'));
				});
			});
			
			res.end('ok');
		}

	};