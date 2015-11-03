

Template.teacher_play_login.getStudentPath = function(){
	return window.location.protocol+'/'+window.location.host+'/game/'+this._id;
	
}
Template.teacher_play_login.getTeacherPath = function(){
	return window.location.protocol+'/'+window.location.host+'/'+Meteor.user().username;
}

Template.teacher_play.current_phase = function(id) {
		if(this.phase == -1){ if(id == 'Login') return true; else return false;}	
		if(this.phase == 9999 || this.phase >= this.phases.length){ if(id == 'Results') return true; else return false;}	
		if(this.phase > this.phases.length){ if(id == 'Results') return true; else return false;}
		return this.phases[this.phase].type == id;
};

Template.teacher_play.events({
	'click #back_button': function(){
		Router.go('teacher');
	}
});


//MENU
Template.teacher_play_menu.events({
	'click #login_phase_button': function(e){
		//set_phase('Login');
	},
	'click .phase_button': function(e){				
		if(!$(e.currentTarget).hasClass('inactive')){
			set_phase(this.id);
		}		
	},
	'click #results_phase_button': function(e){
		if(!$(e.currentTarget).hasClass('inactive')){	
			set_phase(9999);
		}
	}
});

Template.teacher_play_menu.button_state = function(button_id, current_phase, phases){	
	if(current_phase == -1){
		if(button_id == -1) return ' selected inactive';
		if(button_id == phases[0].id) return ' ';
		return ' inactive ';
	}
	
	if(current_phase == 9999 || current_phase >  phases.length - 1){
		if(button_id == 9999) return ' selected inactive'; else return ' inactive ';
	}
	if(phases[current_phase].id == button_id) return ' selected inactive';
	if(current_phase == phases.length - 1){
		if(button_id == 9999) return ''; else return ' inactive ';
	}
	if(phases[current_phase+1].id == button_id) return ' ';
	return ' inactive ';
}



Template.teacher_play_menu.n_logged_in = function(){
	return Students.find().count();
}


Template.teacher_play_menu.n_offered = function(id){
	var answered = Students.find({phases: {$elemMatch:{'id': id, offer:{"$exists":true}}}}).count();	
	var total = Students.find({'phases.id': id}).count();
	return answered + '/' + total;
}




