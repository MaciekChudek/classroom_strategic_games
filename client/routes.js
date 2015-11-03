Router.configure({
  layoutTemplate: 'layout',  
  loadingTemplate: 'loading'
});

Router.onBeforeAction('loading');

check_teacher_loggedin = function(pause){
			if(Meteor.userId() == null){
				Router.go('teacher')
				pause();
			}
		}

Router.map(function() {

	this.route('teacher_results', {
		path: '/teacher/results/:_id',
		template: 'teacher_results',
		onBeforeAction: function(){
			check_teacher_loggedin();
			set_active_game();
		},
		waitOn: function() { 			return [
				Meteor.subscribe('Games'),
				Meteor.subscribe('Students', this.params._id)			
				];},
		data: function() { Session.set('game_id', this.params._id); return  Games.findOne(this.params._id);},
		onData: function(pause){			
			if(typeof this.data() === 'undefined'){
				Router.go('teacher')
				pause();
			}			
		}	
	});
	
	this.route('teacher_register', {
		path: '/teacher/register',
	}); 
	
	this.route('teacher_design', {
		path: '/teacher/design/:_id',
		onBeforeAction: function(){
			check_teacher_loggedin();
			set_active_game();
			},
		waitOn: function() { return Meteor.subscribe('Games')},
		data: function() { Session.set('game_id', this.params._id); return  Games.findOne(this.params._id);},
		onData: function(pause){			
			if(typeof this.data() === 'undefined'){
				Router.go('teacher')
				pause();
			}			
		}
	});

	this.route('teacher_play', {
		path: '/teacher/play/:_id',
		waitOn: function () {
			return [
				Meteor.subscribe('Games'),
				Meteor.subscribe('Students', this.params._id)			
				]
		},
		onBeforeAction: function(){
			check_teacher_loggedin()
			set_active_game(this.params._id);
			},
		data: function() {
			var game =  Games.findOne(this.params._id);
			Session.set('game_id', this.params._id); 
			return game;
		},
		onData: function(pause){			
			if(typeof this.data() === 'undefined'){
				Router.go('teacher')
				pause();
			}			
		}	
	});
		
	this.route('teacher', {
		path: '/teacher',
		onBeforeAction: function(){
			set_active_game();
			},
		waitOn: function () {
			return [
				Meteor.subscribe('Games'),
				//Meteor.subscribe('Students')			
				]
		}
    });
	
	this.route('student_login_redirect', {
		path: '/:teacher_id',
		template: 'student_null',
		onBeforeAction: function(){
		},
		waitOn: function () {
			return Meteor.subscribe('ActiveGame', this.params.teacher_id);
		},
		onData: function(pause){			
			if(typeof this.ready()){
				var game = Games.findOne();
				if(typeof game !== 'undefined' && _.has(game, '_id')){

					Router.go('student',  {game_id: game._id});
					pause();
				}
			}	
		}	
	});
	
	this.route('student', {
		path: '/game/:game_id',
		onBeforeAction: function(){
			try_to_login(this.params.game_id);
		},
		waitOn: function () {
			return [
				Meteor.subscribe('Games', this.params.game_id),
				Meteor.subscribe('Students', this.params.game_id, Session.get('student_id'))			
				]
		},
		data: function () {			
			if (this.ready()){
				var game = Games.findOne();
				if(game){
					phase = null
					if(game.phase == -1) phase = phase_prototypes['Login'];
					if(game.phase >= game.phases.length) phase = phase_prototypes['Results'];
					if(phase === null) phase = game.phases[game.phase];
					return {
						phase: phase,
						phase_index: game.phase,
						game_id: this.params.game_id,
						student: Students.findOne()
					}
				}
			}
		}
		
	});
	
	//default root goes to student
	this.route('student_null', {path: '/student_null',template: 'student_null'});
	
	this.route('default', {path: '*',template: 'student_null'});
});
