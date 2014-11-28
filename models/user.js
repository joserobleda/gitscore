
	var app		= require('neasy');
	var Model 	= require('neasy/model');
	var Backbone = app.require('backbone');

	var User = Model.extend({
		// @override
		toJSON: function () {
			// call the "super" method
			var json = Model.prototype.toJSON.call(this);

			// var unused = [
			// 	"followers_url", "gists_url", "following_url",
			// 	"starred_url", "subscriptions_url", "organizations_url",
			// 	"gists_url", "repos_url", "events_url", "received_events_url",
			// 	"type", "site_admin", "gravatar_id", "id"
			// ];

			// unused.forEach(function (i) {
			// 	delete json[i];
			// });

			json.score = this.getScore();
			json.quality = this.getQuality();

			// manipulate the json here
			return json;
		},

		getQuality: function () {
			var quality, score, total;

			total	= this.get('pulls') * this.constructor.points.pull;
			score 	= this.getScore();

			quality = score * 100 / total;

			return quality;
		},

		getScore: function () {
			var score = 0, total, pulls, bounces, reviews, points;

			points 	= this.constructor.points;
			pulls	= this.get('pulls');
			bounces	= this.get('bounces');
			reviews	= this.get('reviews');

			total  = pulls * points.pull;
			score  = total - (bounces * points.bounce) - (reviews * points.review);

			if (score <= 0) {
				score = 0;
			}

			return score;
		}
	});

	User.points = {
		pull: 10,
		bounce: 2,
		review: 1
	};

	User.class = 'users';

	User.Collection = Backbone.Collection.extend({
		model: User,
		comparator: function (user) {
			return 1 - user.getScore();
		}
	});


	module.exports = User;