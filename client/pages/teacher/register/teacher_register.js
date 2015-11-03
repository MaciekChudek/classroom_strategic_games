Session.set('teacher_register_incorrect',false);

Template.teacher_register_login.failed_attempt = function(){
	return Session.get('teacher_register_incorrect')
	};

Template.teacher_register.current_url = function(){
	return Meteor.absoluteUrl();
}


Template.teacher_register_login.events({
	'focus #teacher_register_password_input': function(e){ $(e.currentTarget).val('');},
	'keypress #teacher_register_password_input': function(e){ 
		if(e.keyCode == 13){
			if($(e.currentTarget).val() == 'Origin'){	//super insecure, but meh...		
				Session.set('teacher_register_incorrect',false);
				Session.set('teacher_register_authorized',true);
			} else { 
				Session.set('teacher_register_incorrect',true);
			}		
		}
	}
});


Template.teacher_register.authorized = function(){
	if(Meteor.user() != null){
		Router.go('teacher')
	} else {
		return Session.get('teacher_register_authorized');
	}
}

Template.teacher_register.created = function(){
	Session.set('teacher_register_authorized',false);
}

Template.teacher_register.events({
	'click #teacher_register_button': function(e){ 
		var user = $('#teacher_register_username').val();
		var pass = $('#teacher_register_password').val();
		
		if(user && user != '' && pass && pass != ''){
			Accounts.createUser({
				username: user,
				password: pass
				}, function(error){
				if(!error){
					add_default_games();					
					Router.go('teacher');
				}
			});
		}
	},
});
