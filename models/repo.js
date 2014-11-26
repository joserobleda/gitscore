
	var app		= require('neasy');
	var Model 	= require('neasy/model');
	var User 	= require('./user.js');
	var Pull 	= require('./pull.js');
	var Q 		= app.require('q');


	var Repo = Model.extend({
		full_name: '',

		initialize: function (attrs) {
			this.full_name 	= attrs.owner + '/' + attrs.repo;
		},

		// @override
		toJSON: function () {
			// call the "super" method
			var json = Model.prototype.toJSON.call(this);

			json.full_name = this.full_name;

			// manipulate the json here
			return json;
		},

		getPullsFromUser: function (user) {
			var deferred, reduce, initial, keys, condition, finalize;

			deferred = Q.defer();

			condition = {
				'head.repo.full_name': this.full_name,
				'user.login': user
			};

			keys = {
				id: 1,
				number: 1,
				html_url: 1,
				title: 1,
				created_at: 1,
				updated_at: 1,
				user: 1
			};

			initial = {
				bounces: 0,
				reviews: 0
			};

			reduce = function (curr, result) {
				result.bounces += (curr.bounces || 0);
				result.reviews += (curr.reviews || 0);
			};

			finalize = function (curr) {
				return curr;
			};

			this.db.group(this.constructor.class, keys, condition, initial, reduce, finalize, function (err, results) {
				if (err) {
					return deferred.reject(new Error(err));
				}

				var pulls = new Pull.Collection(results);
				deferred.resolve(pulls);
			});

			return deferred.promise;
		},

		getUsers: function (username) {
			var deferred, reduce, initial, keys, condition, finalize;

			deferred = Q.defer();

			keys = {
				user: 1
			};

			initial = {
				pulls: 0,
				bounces: 0,
				reviews: 0
			};

			condition = {
				'head.repo.full_name': this.full_name
			};

			reduce = function (curr, result) {
				result.pulls += 1;
				result.bounces += (curr.bounces || 0);
				result.reviews += (curr.reviews || 0);
			};

			finalize = function (curr) {
				var user = JSON.parse(JSON.stringify(curr.user));

				user.pulls 		= curr.pulls;
				user.bounces 	= curr.bounces;
				user.reviews 	= curr.reviews;

				return user;
			};

			this.db.group(this.constructor.class, keys, condition, initial, reduce, finalize, function (err, results) {
				if (err) {
					return deferred.reject(new Error(err));
				}

				var users = new User.Collection(results);

				users.each(function (model, index) {
					model.attributes.ranking = index + 1;
				});

				if (username) {
					var found = false;

					users.each(function (model, index) {
						if (model.get('login') === username) {
							found = true;
							deferred.resolve(model);
							return false;
						}
					});

					if (found === false) {
						deferred.reject();
					}
				} else {
					deferred.resolve(users);
				}
			});

			return deferred.promise;
		}
	});

	Repo.class = 'pulls';

	module.exports = Repo;