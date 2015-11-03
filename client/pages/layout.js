Template.layout.events({
	'click #logout_button': function(e){
		Meteor.logout(function(){
			Router.go('teacher')
		})
	}
});
