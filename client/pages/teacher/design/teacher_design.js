Template.teacher_design.events({
	'blur #game_name_input': function(e){
		update_game_name($(e.currentTarget).val());
	},
	'click #back_button': function(){
		Router.go('teacher');
	}
});

Template.teacher_design.destroyed = function(){
	Session.set('selected_phase', null);
	Session.set('game_id', null);
}


Template.teacher_design.selected_phase = function(){
	var phase_id = Session.get('selected_phase');
	if(!_.has(this,'phases') || typeof phase_id === 'undefined' || phase_id == -1) return null;
	return _.find(this.phases, function(phase) {return phase.id == phase_id;});
}



Template.teacher_design_content.destroyed = function(){

}

Template.teacher_design_content.has = function(e){
	return _.has(this, e)
}


Template.teacher_design_content.active_button = function(e){
	if(_.has(this, 'target'))if(this.target == e) return 'active';	
	return '';	
}



Template.teacher_design.events({
	'click .target_button': function(e){
			save_phase({target: $(e.currentTarget).attr('data-target')});
			$('.target_button').removeClass('active');
			$(e.currentTarget).addClass('active');
	},
	'click #add_phase_button': function(e){
		bootbox.dialog({
			message: 'Add which kind of phase?',
			title: "Phase type?",			
			buttons: phase_types
		});
	},
	'click .target_help': function(e){bootbox.alert(target_help_string);},
	'click .message_help': function(e){bootbox.alert(message_help_string);},
	'click .multiplier_help': function(e){bootbox.alert(multiplier_help_string);},
	'click .phase_help': function(e){bootbox.alert(phase_help[this.type]);},
	'click .phase_button': function(e){ Session.set('selected_phase', this.id); },
	'click .delete_button': function(e){
		bootbox.confirm('Are you sure you want to permanently delete this phase?', function(e){
			if(e){
				delete_phase(this.id);
				Session.set('selected_phase', -1);
			 }
		});
	},
	'blur #multiplier_input': function(e){
		var x = $(e.currentTarget)
		var y = parseFloat(x.val())
		if(isNaN(y)){
			x.val('')
		} else {
			save_phase({multiplier: y})
		}
	},
	
	'blur #message_input': function(e){
		save_phase({message: $(e.currentTarget).val()})
	}
});


save_phase = function(data){
	phase_id = Session.get('selected_phase');
	
	if(typeof phase_id === 'undefined' || phase_id == -1) return null;
	update_phase(phase_id, data)
	
	
}
