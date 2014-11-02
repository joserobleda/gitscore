
	var app		= require('neasy');
	var Model 	= require('neasy/model');
	var Backbone = app.require('backbone');

	var Pull = Model.extend({

	});


	Pull.class = 'pulls';

	Pull.Collection = Backbone.Collection.extend({
		model: Pull,
		comparator: function (pull) {
			return 1;
			var date = new Date(pull.get('created_at'));
			return -date.getTime();
		}
	});

	module.exports = Pull;