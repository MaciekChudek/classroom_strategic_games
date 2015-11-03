var unique;

Template.toggle_buttons.events({
	'click .toggle_button': function (e,i) {
		
		unique = i.data.unique || false;
		var toggles =  i.findAll('.toggle_button');
		
		if(unique){ //turn everything off first
			_.each(toggles, function(toggle){
				$(toggle).removeClass('selected');
			});
		}
		
		$(e.currentTarget).toggleClass('selected');
		
		set_session_data(i);
		console.log

	}
});

function set_session_data(i){
	var toggled_values = _($(i.findAll('.toggle_button.selected')).toArray()).map(function(e) { return e.getAttribute("button_value") })
	if(unique) toggled_values = toggled_values[0];
	Session.set(i.data.button_set_id, toggled_values)
}
