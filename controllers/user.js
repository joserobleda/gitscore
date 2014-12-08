
	var User = require('../models/user');
	var PullRequest = require('../models/pull');
	var Repo = require('../models/repo');


	module.exports = {

		/***
		   * The landing page
		   *
		   */
		landing: function (req, res, next) {
			return res.end('200 OK');
		},

		/***
		   * User of a repo
		   *
		   */
		userInRepo: function (req, res, next) {
			var repository = new Repo({
				owner: req.params.owner,
				repo: req.params.repo
			});

			if (req.accepts('html, json') === 'json') {
				var promise = repository.getUsers({
					username: req.params.user
				});

				promise.then(function (user) {
					res.json(user.toJSON());
				}).fail(function () {
					res.status(404).end();
				});

				return;
			}

			repository.getPullsFromUser(req.params.user).then(function (pulls) {
				if (pulls.length === 0) {
					return res.status(404).end();
				}

				res.render('pulls.twig', {
					user: pulls.first().get('user'),
					pulls: pulls.toJSON(),
					repository: repository
				});
			}).fail(function (err) {
				res.status(500).end(err);
			});
		},

		/***
		   * Repo here
		   *
		   */
		repo: function (req, res, next) {
			var repository, promise, filter = {};

			if (isNaN(req.query.days) === false) {
				filter.days = req.query.days;
			}

			repository	= new Repo({owner: req.params.owner, repo: req.params.repo});
			promise 	= repository.getUsers(filter);

			if (req.accepts('html, json') === 'json') {
				promise.then(function (users) {
					res.json(users.toJSON());
				}).fail(function () {
					res.status(404).end();
				});

				return;
			}

			promise.then(function (users) {
				res.render('index.twig', {
					users: users.toJSON(),
					repository: repository.toJSON()
				});
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
			var title 		= pull.title;
			var sender 		= req.body.sender || {};
			var comment 	= req.body.comment || {};

			console.log("Action: " + action + " - Repo: " + repository.full_name + ". Pull: " + pull.number);

			var assigneeLogin = assignee ? assignee.login : '';
			console.log("Creator: " + creator.login + " - Asignee: " + assigneeLogin);

			PullRequest.findOrCreate({id: pull.id}, pull).then(function (pull) {
				var bounces, reviews, comments;

				if (undefined === (bounces = pull.get('bounces'))) {
					bounces = 0;
				}

				if (undefined === (reviews = pull.get('reviews'))) {
					reviews = 0;
				}

				if (undefined === (comments = pull.get('comments'))) {
					comments = [];
				}

				if (req.body.action === 'assigned' && creator.login === assigneeLogin) {

					if (sender.login === assigneeLogin) {
						console.log("Self-assigned, no bounces");
					} else {
						console.log("+1 Bounce!!!!");
						bounces = bounces + 1;
					}
				}

				if (req.body.action === 'created' && sender.login) {
					if (sender.login !== creator.login) {

						var commentString = comment.commit_id + ':' + comment.path + ':' + comment.position;
						if (comments.indexOf(commentString) === -1) {
							comments.push(commentString);
							reviews = reviews + 1;

							console.log("+1 review")
						} else {
							console.log('A new comment on existing review: ' + commentString);
						}
					} else {
						console.log('Review from creator');
					}
				}

				var update = {
					'reviews': reviews,
					'bounces': bounces,
					'updated_at': updated,
					'title': title,
					'comments': comments
				};

				pull.set(update).save().then(function () {
					console.log('bounces: ' + pull.get('bounces') + ' - reviews: ' + pull.get('reviews'));
				});
			});

			res.end('ok');
		}

	};