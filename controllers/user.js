
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
			var action		= req.body.action;
			var pull 		= req.body.pull_request;
			if (!pull) {
				console.log("invalid pull", req.body);
				return res.end();
			}

			var repository	= pull.head.repo;
			var creator 	= pull.user;
			var assignee 	= pull.assignee;
			var updated 	= pull.updated_at;

			console.log("Action: " + action + " - Repo: " + repository.full_name + ". Pull: " + pull.number);
			if (req.body.action !== 'assigned') {
				return res.end();
			}

			var assigneeLogin = assignee ? assignee.login : '';
			console.log("Creator: " + creator.login + " - Asignee: " + assigneeLogin);

			if (creator.login !== assigneeLogin) {
				return res.end();
			}

			console.log("Bounced! +1 !!!!");

			PullRequest.findOrCreate({id: pull.id}, pull).then(function (pull) {
				var bounces;

				if (undefined === (bounces = pull.get('bounces'))) {
					bounces = 0;
				}

				var update = {
					'bounces': bounces + 1,
					'updated_at': updated
				};

				pull.set(update).save().then(function () {
					console.log('bounces: ' + pull.get('bounces'));
				});
			});
			
			res.end('ok');
		}

	};