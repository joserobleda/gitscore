
	var User = require('../models/user');
	var PullRequest = require('../models/pull');
	var Repo = require('../models/repo');


	module.exports = {

		/***
		   * Hooks here
		   *
		   */
		landing: function (req, res, next) {
			return res.end('200 OK');
		},

		/***
		   * Repo here
		   *
		   */
		repo: function (req, res, next) {
			var repository = new Repo({owner: req.params.owner, repo: req.params.repo});
			repository.getUsers().then(function (users) {
				res.end(users.length + ' users');
			}).fail(function (err) {
				res.end(err);
			});

			// db.pulls.group({key: {'user.login':1}, reduce: function (curr, result) {}, initial: {},  });
			// db.pulls.find({"head.repo.full_name":"joserobleda/node-po-editor", "updated_at": {$gte: "2014-10-18T00:00:00"}})
		},

		/***
		   * Hooks here
		   *
		   */
		hook: function (req, res, next) {
			var eventType 	= req.headers['x-github-event'];

			if (eventType != 'pull_request_review_comment' && eventType != 'pull_request') {
				console.log("invalid event type", eventType);
			}

			
			var pull = req.body.pull_request;

			if (!pull) {
				console.log("invalid pull", req.body);
				return res.end();
			}

			var action		= req.body.action;
			var repository	= pull.head.repo;
			var creator 	= pull.user;
			var assignee 	= pull.assignee;
			var updated 	= pull.updated_at;

			console.log("Action: " + action + " - Repo: " + repository.full_name + ". Pull: " + pull.number);

			var assigneeLogin = assignee ? assignee.login : '';
			console.log("Creator: " + creator.login + " - Asignee: " + assigneeLogin);

			PullRequest.findOrCreate({id: pull.id}, pull).then(function (pull) {
				var bounces, reviews;

				if (undefined === (bounces = pull.get('bounces'))) {
					bounces = 0;
				}

				if (undefined === (reviews = pull.get('reviews'))) {
					reviews = 0;
				}

				if (req.body.action === 'assigned' && creator.login === assigneeLogin) {
					console.log("+1 Bounce!!!!");
					bounces = bounces + 1;
				}

				if (req.body.action === 'created' && req.body.sender) {
					if (req.body.sender.login != creator.login) {
						reviews = reviews + 1;
					} else {
						console.log('Review from creator');
					}
				}

				var update = {
					'reviews': reviews,
					'bounces': bounces,
					'updated_at': updated
				};

				pull.set(update).save().then(function () {
					console.log('bounces: ' + pull.get('bounces') + ' - reviews: ' + pull.get('reviews'));
				});
			});
			
			res.end('ok');
		}

	};