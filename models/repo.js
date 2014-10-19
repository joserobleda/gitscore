
	var app		= require('neasy');
	var Model 	= require('neasy/model');
	var User 	= require('./user.js');
	var Q 		= app.require('q');

	// User collection class
	var UserCollection = app.require('backbone').Collection.extend({});


	var Repo = Model.extend({
		full_name: '',

		initialize: function (attrs) {
			this.full_name 	= attrs.owner + '/' + attrs.repo;
		},

		getUsers: function () {
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

				var users = results.map(function (user) {
					return new User(user);
				});

				users = new UserCollection(users);
				deferred.resolve(users);
			});

			return deferred.promise;
		}
	});

	Repo.class = 'pulls';

	module.exports = Repo;