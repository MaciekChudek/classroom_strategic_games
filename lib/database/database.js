Students = new Meteor.Collection("students");
Games = new Meteor.Collection("games");

Meteor.methods({
		//STUDENT PLAY
		set_offer: function(offer, student_id ){
			var student = Students.findOne(student_id);
			if (_.has(student,'game')){				
				var game = Games.findOne(student.game);
				var phase_id = game.phases[game.phase].id;
				
				var z = Students.find({	_id: student_id, phases: {$elemMatch: {'id': phase_id}}}).fetch();
				Students.update({_id: student_id, phases:{$elemMatch:{'id': phase_id}}}, {$set: {'phases.$.offer': offer} });
				var y = Students.find({	_id: student_id, phases: {$elemMatch: {'id': phase_id}}}).fetch();
			}
		},
		//TEACHER PLAY
		reset_game: function(game_id){
			Games.update({_id: game_id, teacher: this.userId}, {$set: {phase: -1}});					
		},
		reset_game_and_delete_students: function(game_id){			
			Games.update({_id: game_id, teacher: this.userId}, {$set: {phase: -1}});			
			Students.remove({game: game_id});			
		},
		//Teacher GENERAL
		set_active_game: function(game_id){ //should handle 'undefined' gracefully
			
			Games.update({_id: {$ne: game_id}, teacher: this.userId}, {$set: {playing: false}}, {multi: true});			
			Games.update({_id: game_id, teacher: this.userId}, {$set: {playing: true}});		
		},
		
		//TEACHER DESIGN
		add_phase: function(game, type){
			if(this.userId !== null && _.has(phase_prototypes, type)){
				id = _.max( Games.findOne(game, {fields: {'phases.id': 1}}).phases, function(phase){return phase.id}).id +1;
				if(isNaN(id) || id == null || typeof id === 'undefined') id = 1;
				var proto = phase_prototypes[type];
				proto.id = id;
				Games.update(game, {$push: {phases: proto}});
				return id;
			}
			return -1;
		},
		delete_phase: function(game, id){
			if(this.userId !== null){
				Games.update(game, {$pull: {'phases': {id: id}}});
			}
		},	
		update_phase: function(game, id, data){	
			if(this.userId !== null & typeof data !== 'undefined'){
				d = {}
				if(_.has(data, 'message')) d['phases.$.variables.message'] = data.message;
				if(_.has(data, 'multiplier')) d['phases.$.variables.multiplier'] = data.multiplier;
				if(_.has(data, 'target')) d['phases.$.variables.target'] = data.target;				
				Games.update({_id: game, 'phases.id': id}, {$set: d});				
			}
		},
		delete_game: function(id){
			if(this.userId !== null){
				Games.remove(id);
			}
		},
		add_game: function(){
			if(this.userId !== null){
				var g = game_prototype;
				g.teacher = this.userId;
				g.created = new Date().getTime();
				Games.insert(g);
			}
		},
		
		add_default_games: function(){
			if(this.userId !== null){
				_.each(default_games, function(game){
						var g = game;
						g.teacher = this.userId;
						g.created = new Date().getTime();
						Games.insert(g);
					}, this);
			}
		},		
		update_game_name: function(game, name){
			if(this.userId !== null){
				Games.update(game, {$set: {name: name}});
			}
		}
	}); 


set_phase = function(phase){	
	var game_id = Session.get('game_id');
	if(typeof game_id !== 'undefined' && game_id !== null){
		if(phase == 'Login'){ Meteor.call('reset_game', game_id );}else{
			Meteor.call('advance_phase', game_id);
		}
	}
}





//STUDENT INTERACTIONS
try_to_login = function(game_id){	
	if(typeof Session.get('student_id') == 'undefined'){
		Session.set('student_id', amplify.store('inclass_cooperative_dilemmas_student_id_'+game_id));
	}
}

logging_in = false;
register_student = function(game_id){
	if(!logging_in){
		logging_in = true;
		Meteor.call('add_student', game_id, amplify.store('inclass_cooperative_dilemmas_student_id_'+game_id), function(error, id){
			if(!error){
				amplify.store('inclass_cooperative_dilemmas_student_id_'+game_id, id);
				Session.set('student_id', id);
				Deps.flush();
				logging_in = false;
			}
		});
	}
}
set_offer = function(amount, student_id){
	Meteor.call('set_offer',amount, student_id);
}


//TEACHER GENERAL

set_active_game = function(game_id){
	Meteor.call('set_active_game', game_id);
}


//TEACHER DESIGN PHASE
add_phase = function(type){
	var game = Session.get('game_id');
	if(typeof game !== 'undefined' && game !== null){
		Meteor.call('add_phase',game, type, function(e,id){
			if(!e) Session.set('selected_phase', id);
		});
		
	}
}
delete_phase = function(id){
	var game = Session.get('game_id');
	if(typeof game !== 'undefined' && game !== null){
		Meteor.call('delete_phase',game, parseInt(id));
	}
}
update_phase = function(id, data){
	var game = Session.get('game_id');
	if(typeof game !== 'undefined' && game !== null){
		Meteor.call('update_phase',game, parseInt(id), data);
	}
}
delete_game = function(id){
	Meteor.call('delete_game', id);
}
add_default_games = function(){
	Meteor.call('add_default_games');
}
add_game = function(){
	Meteor.call('add_game');
}
update_game_name = function(name){
	var game = Session.get('game_id');
	if(typeof game !== 'undefined' && game !== null){
		Meteor.call('update_game_name',game, name);
	}
}
reset_game = function(id){
	Meteor.call('reset_game_and_delete_students', id);
}

