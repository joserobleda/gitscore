
	var app		= require('neasy');
	var Model 	= require('neasy/model');
	var Q 		= app.require('q');

	var Repo = Model.extend({
		full_name: '',

		initialize: function (attrs) {
			this.full_name 	= attrs.owner + '/' + attrs.repo;
		},

		getUsers: function () {
			var deferred, reduce, initial, keys, condition;

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

			};

			reduce = function (curr, result) {
				result.pulls += 1;
				result.bounces += curr.bounces;
				result.reviews += curr.reviews;

				result.login = curr.user.login;
				result.avatar_url = curr.user.avatar_url;
				result.url = curr.user.url;
			};


			this.db.group(this.constructor.class, keys, condition, initial, reduce, null, function (err, results) {
				if (err) {
					return deferred.reject(new Error(err));
				}

				deferred.resolve(results);
			});

			return deferred.promise;
		}
	});

	Repo.class = 'pulls';

	module.exports = Repo;