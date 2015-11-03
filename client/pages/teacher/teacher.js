

Template.teacher_main_menu.games = function(){	
	return Games.find();
}
Template.teacher_main_menu.phase_count = function(){
		return this.phases.length;
};


Template.teacher_main_menu.events({
	'click #teacher_design_new_button': function(e){
		add_game();
	},
	'click .delete_button': function(e){
		game_to_be_deleted = $(e.currentTarget).attr('data-id');
		bootbox.confirm('Are you sure you want to permanently delete this game?', function(e){
			if(e){
				delete_game(game_to_be_deleted);
				game_to_be_deleted = null;				
			 }
		});
	},
	'click .reset_button': function(e){
		game_to_be_deleted = $(e.currentTarget).attr('data-id');
		bootbox.confirm('Are you sure you want to permanently delete all student data associated with this game and go back to the log-in phase?', function(e){
			if(e){
				reset_game(game_to_be_deleted);
				game_to_be_deleted = null;				
			 }
		});
	}
});



//teacher login

Template.teacher_login.events({
	'click #teacher_login_button': function(e){
		var user = $('#teacher_login_username').val();
		var pass = $('#teacher_login_password').val();
		
		if(user && user != '' && pass && pass != ''){
			Meteor.loginWithPassword(user, pass);
		}
	}
});

