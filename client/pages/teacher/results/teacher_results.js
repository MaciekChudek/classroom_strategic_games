Template.teacher_results_basic.students = function(){
	return Students.find({game: this._id}, {fields: {score: 1, _id: 1}});	
}

Template.teacher_results_full.students = function(){
	return Students.find({game: this._id});	
}


Template.teacher_results_full.phase_type = function(id, phases){
	var phase = _.find(phases, function(x){ return x.id == id;})
	var str = phase.type;	
	if(_.has(phase.variables, 'multiplier')){
		str += '(*';
		str += phase.variables.multiplier;
		str += ')';
	}
	return str;
}
Template.teacher_results.events({
	'click #back_button': function(){
		Router.go('teacher');
	}
});
