
	var app		= require('neasy');
	var Model 	= require('neasy/model');
	var Backbone = app.require('backbone');

	var User = Model.extend({
		// @override
		toJSON: function () {
			// call the "super" method
			var json = Model.prototype.toJSON.call(this);

			json.icon 		= this.getIcon();
			json.score 		= this.getScore();
			json.quality 	= this.getQuality();

			// manipulate the json here
			return json;
		},

		getIcon: function () {
			var quality = this.getQuality();

			if (quality < 40) {
				return {
					unicode: '1f631',
					emoji: 'scream'
				};
			}

			if (quality < 50) {
				return {
					unicode: '1f4a9',
					emoji: 'poop'
				};
			}

			if (quality < 60) {
				return {
					unicode: '1f44d',
					emoji: '+1'
				};
			}

			if (quality < 70) {
				return {
					unicode: '1f44d',
					emoji: '+1'
				};
			}

			if (quality < 80) {
				return {
					unicode: '1f4aa',
					emoji: ':muscle:'
				};
			}

			if (quality < 90) {
				return {
					unicode: '1f44c',
					emoji: 'ok_hand'
				};
			}

			if (quality < 100) {
				return {
					unicode: '1f60e',
					emoji: 'sunglasses'
				};
			}

			return {
				unicode: '1f47d',
				emoji: 'alien'
			};
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