Template.student.is_phase = function(e){
	return this.phase.type == e;
}

Template.student_logged_in.get_student_id = function(){		
		if(typeof this.student === 'undefined'){	//not logged in			
			register_student(this.game_id);
			return 'Applying for ID....'
		} else {
			return this.student._id;
		}
}

Template.student_decision.has_offer = function(){
	return _.has(this.student.phases[this.phase_index], 'offer');
}

Template.student_decision.offer = function(){
	return this.student.phases[this.phase_index].offer;
}


Template.student_game_content.is_phase = function(e){
	return this.phase.type == e;
}

function fade_slider(){
	$('.slider-volume').fadeTo('slow',0);
	//$('.button').addClass('inactive');
	//$('.button').text('Done');
	$('.button').remove('Done');
	$('.track').off('mousedown');
	$('.track').css('cursor', 'default');
	$("body").off('mousemove').off('mouseup');	
}

Template.student_dichotomous.is_offer = function(offer){
	phase = this.student.phases[this.phase_index];
	if(!_.has(phase, 'offer')){
		if(offer == 'none') return true; else return false;
	}
	return (phase.offer == offer);
}
Template.student_dichotomous.events({
	'click #student_decision_yes': function(){	
			set_offer(1, Session.get('student_id'));
	},	
	'click #student_decision_no': function(){	
			set_offer(0, Session.get('student_id'));
	},	
});
Template.student_decision.events({	
	'click #make_offer': function(){		
			if(!$('.button').hasClass('inactive')){
				fade_slider();
				console.log('setting response:', Session.get('response_slider'))
				set_offer(Session.get('response_slider'), Session.get('student_id'));
			}
	}
});

function get_slider_maximum(phase_index, phase, student){
	var type = phase.type;
	if(type == 'Dictator' || type == 'Exploitation' || type == 'Punishment'){
		return student.phases[phase_index].max_offer
	} else return student.score;
}

Template.student_game_content.parse_message = function(){	
	console.log('rendering:', this.student.phases[this.phase_index])
	return (this.student.phases[this.phase_index].message + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br />' + '$2');	 
}


Template.student_decision.helpers({
	amount: function(){
		return Session.get('response_slider');
	},
	slider_data:  function(){
	if(_.has(this.student, 'offer')){
		Session.set('response_slider', this.student.offer);
		Meteor.setTimeout(function(){fade_slider();}, 500);
		return {id: 'response_slider',min_range: this.student.offer,max_range: this.student.offer};
	}
	return {
		id: 'response_slider',
		min_range: 0,
		max_range: get_slider_maximum(this.phase_index, this.phase, this.student)
	};},
	received_amount: function(){
		var offer = this.student.partner.offer;
		if(offer == 0) {set_response(0,  this.student._id);}		
		return this.student.partner.offer;
	},
	received_anything: function(){return this.student.partner.offer > 0;}
	
});











/*

Template.student.phase = function(){
	return Games.findOne().phase;
}
Template.student.student = function(){
	return Students.findOne();
}


Template.student_decision.events({
	'click #make_offer': function(){
		if(!_.has(this.student,'offer')){	
			$('.slider-volume').fadeTo('slow',0);
			$('.button').addClass('inactive');
			$('.button').text('Offer made');
			$('.track').off('mousedown');
			$('.track').css('cursor', 'default');
			$("body").off('mousemove').off('mouseup');
			set_offer(Session.get('offer_slider'), this.student._id);
		}
	}
});

Template.student_decision.amount = function(){
	return Session.get('offer_slider');
}


Template.student_response.helpers({
	amount: function(){
		return Session.get('response_slider');
	},
	slider_data:  function(){return {
		id: 'response_slider',
		min_range: 0,
		max_range: this.student.partner.offer
	};},
	received_amount: function(){
		var offer = this.student.partner.offer;
		if(offer == 0) {set_response(0,  this.student._id);}		
		return this.student.partner.offer;
	},
	received_anything: function(){return this.student.partner.offer > 0;}
	
});


Template.student_response.events({
	'click #make_response': function(){
		if(!_.has(this.student,'response')){		
			$('.slider-volume').fadeTo('slow',0);
			$('.button').addClass('inactive');
			$('.button').text('Offer made');
			$('.track').off('mousedown');
			$('.track').css('cursor', 'default');
			$("body").off('mousemove').off('mouseup');
			set_response(Session.get('response_slider'), this.student._id);
		}
	}
});










Template.student_logged_in.helpers({
	student_id: function(){		
		return Session.get('student_id');
	}
});

Template.student.created = function(){

}

Template.student.helpers ({
	
	student_content: function(phase, student){		
		
		if(typeof phase === 'undefined'){
			return {no_game: true};
		}
		
		if(typeof student === 'undefined' ){	//not logged in			
			if(phase != 'login'){
				return {no_login: true};
			} else {
				register_student();
			}
		}
		
		if(phase == 'login'){
			return {logged_in: true, student: student};
		}
		if(phase == 'decision'){
			return {decision: true, student: student};
		}
		if(phase == 'response'){
			return {response: true, student: student};
		}
		if(phase == 'results'){
			return {results: true, student: student};
		}
	}
});
*/
