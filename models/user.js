
	var app		= require('neasy');
	var Model 	= require('neasy/model');


	var User = Model.extend({
		// @override
		toJSON: function () {
			// call the "super" method
			var json = Model.prototype.toJSON.call(this);

			json.score = this.getScore();

			// manipulate the json here
			return json;
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
			} else {
				score = score * 100 / total;
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

	module.exports = User;