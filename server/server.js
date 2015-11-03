

Teachers = new Meteor.Collection("teachers");

//Students.remove({});
//Games.remove({});

Students.allow({
	update: function(userId, doc, fields, modifier){ //can only update your own offer
		//.log(['rr',docs, 'fields'])
		return (userID == doc._id && fields.length == 1 && fields[0] == 'phase.offer');
	},
	remove: function(userId, doc){ //can only update your own offer
		return false;
	},
	fetch: ['_id','game']
});

Meteor.publish('ActiveGame',function(teacher_name){
	var teacher = Meteor.users.findOne({username: teacher_name}, {fields: {_id: 1}});	
	
	if(typeof teacher === 'undefined') {this.ready(); return;}
	
	teacher_id = teacher._id;
	var x = Games.find(
			{teacher: teacher_id, playing: true},
			{fields: {_id: 1}}
		);
	return x;
});

Meteor.publish('Games',function(game_id){ 
	if(this.userId != null){
		return Games.find({teacher: this.userId}, {sort: {created: 1}});
		/*var games = Games.find({teacher: this.userId}, {sort: {created: 1}});
		
		if(games.count() > 0){
			return games;
		} else {
			this.ready();	
		}*/
	}
	if(typeof(game_id)==='undefined'){
		this.ready();		
	}	else { 
		return Games.find(
			{_id: game_id, playing: true},
			{fields: {phase: 1, 
				'phases.type': 1,
				'phases.id': 1,
				'phases.variables.message': 1,
				'phases.variables.multiplier': 1
				}}
		);
	}
});

Meteor.publish('Students',function(game_id, student_id){ 	
	if(this.userId != null){ //teacher
			return Students.find({game: game_id});
	} else if (typeof student_id !== 'undefined' && student_id !== null){ //student
		
		return Students.find({_id: student_id}, { fields: { 
			'phases.target': 0,
			'phases.target_score': 0,
			'phases.actor': 0,		
			} });
	//	return Students.find();
	}
	this.ready();
});


find_random_partner = function(students, phase){
	//pair everyone with a stranger
	var n = students.length;
	if(n <2) return null; //can't pair one guy
	var a = _.range(n);
	var b = _.shuffle(a); //random shuffle
	
	for (var i=0;i<n;i++){ if(a[i] == b[i]){ //check for accidental self-partnering
		var j = i; while(j == i){ j = _.sample(a);} //swap with anyone else
		var swap = b[j]; b[j] = b[i]; b[i] = swap;
	}}
	
	
	for (var i=0;i<n;i++){
		students[a[i]].phases[phase].target = students[b[i]]._id;
	}
	
	return students;
}

find_targets = function(phases, phase, students){
	type = phases[phase].variables.target;
	if(phase < 2 || ! _.has(phases[phase-1].variables, 'target')){ //no previous targets
		type = 'Random';
	}

	if(type == 'Repeat'){
		for (var i=0;i<students.length;i++){
			students[i].phases[phase].target = students[i].phases[phase-1].target;
		};
	}
	
	if(type == 'Reciprocate'){
		for (var i=0;i<students.length;i++){
			var actor = _.find(students, function(x) {return x.phases[phase-1].target == students[i]._id;} );	
			students[i].phases[phase].target = actor._id;
		};
	}
	
	if(type == 'Random'){
		students = find_random_partner(students, phase);
	}
	
	if(students == null) return null;
	
	return students; 
}

get_message_parts = function(str){
	
	var strs = str.replace(/\[\w+:?\d*\]?/g, '‡‡‡').split('‡‡‡');
	if(strs.length == 1) return {strs: strs};
	
	var vars = str.match(/\[(\w+:?\d*)?(?=\])/g)
	var ts = [];
	var ns = [];
	for(i = 0; i< vars.length; i++){
		var v = vars[i].replace('[','');
		ts[i] = v.match(/^\w+/)[0];
		ns[i] = parseInt(v.match(/\d*$/g)[0]);
		if(isNaN(ns[i])) ns[i] = 1;
	}
	
	return {strs: strs, ts: ts, ns: ns};
}

set_custom_message = function(phases, phase, students){
	var m = phases[phase].variables.message;	
	if(typeof m == 'undefined') return students;
	var mpts = get_message_parts(m);
	for (var i=0;i<students.length;i++){
		if(mpts.strs.length == 1){
			m = mpts.strs[0];
		} else {
			m = '';
			for(var k = 0; k<mpts.strs.length; k++){
				m += mpts.strs[k];
				var target = null;
				if(_.has(students[i].phases[phase], 'target')) target = students[find_student_index(students, students[i].phases[phase].target)];
				m += get_message_var(phase, mpts.ts[k], mpts.ns[k], students[i], target);
			}
		}
		students[i].phases[phase].message = m;
	}
	return students;
}	

get_message_var = function(phase, type, n, me, target){
	var v = '';
	try{
		if(type == 'score') v = me.score;
		if(type == 'act') v = me.phases[phase-n].active_income;
		if(type == 'consequence') v = me.phases[phase-n].passive_income;
		
		if(target !== null){
			if(type == 'target_score') v = target.score;
			if(type == 'target_act') v = target.phases[phase-n].active_income;		
			if(type == 'target_consequence') v = target.phases[phase-n].passive_income;
		}
	} catch (err) {
		return '';
	}

	if(v == 'undefined') return '';
	return v;
}

find_student_index = function(students, _id){ //gotta be a more efficient way to do this... but I wanna allow for the possibility of students dropping out, the array order changing, etc.
	for (var i=0;i<students.length;i++){if(_id == students[i]._id){	return i;}}
	return null;
}

finalise_phase = function(phases, phase, students){
	if(phase <0  || phase >= phases.length){return null;}
	var type = phases[phase].type;
	if(type == 'Login' || type == 'Results' || type == 'Endowment'){ return null;}
	
	
	var multiplier = set_multiplier(phases, phase, 1);		
	
	for (var i=0;i<students.length;i++){
		
		if(!_.has(students[i].phases[phase], 'offer')){
			students[i].phases[phase].offer = 0;
		} else {
			students[i].phases[phase].offer = parseInt(students[i].phases[phase].offer);
		}
		if(!_.has(students[i].phases[phase], 'max_offer') && students[i].phases[phase].offer > students[i].phases[phase].max_offer) students[i].phases[phase].offer = students[i].phases[phase].max_offer;
	}
	
	if(type == 'Dictator'){
		for (var i=0;i<students.length;i++){			
			var offer = students[i].phases[phase].offer;
			students[i].score -= offer;
			students[i].phases[phase].active_income = offer;			
			var actor = _.find(students, function(x) {	return x.phases[phase].target == students[i]._id;} );
			income = Math.round(multiplier * actor.phases[phase].offer);
			students[i].score += income;
			students[i].phases[phase].passive_income = income;
		}
		return students;
	}
	if(type == 'Exploitation'){
		for (var i=0;i<students.length;i++){
			var offer = Math.round(multiplier * students[i].phases[phase].offer);
			students[i].score += offer;
			students[i].phases[phase].active_income = offer;			
			
			var actor = _.find(students, function(x) {return x.phases[phase].target == students[i]._id;} );
			income = actor.phases[phase].offer;

			students[i].score -= income;
			students[i].phases[phase].passive_income = income;
		}
		return students;
	}
	if(type == 'Punishment'){
		for (var i=0;i<students.length;i++){
			var offer = students[i].phases[phase].offer;
			students[i].score -= offer;
			students[i].phases[phase].active_income = offer;
			var actor = _.find(students, function(x) {return x.phases[phase].target == students[i]._id;} );
			income = Math.round(multiplier * actor.phases[phase].offer);
			students[i].score -= income;
			students[i].phases[phase].passive_income = income;
		}
		return students;
	}
	if(type == 'Ultimatum'){
		if(phase < 2 || !_.has(phases[phase-1].variables, 'target')){ //no previous targets, ultimatum doesn't make sense
			return null;
		}
		//ok, this is the tricky part
		multiplier = set_multiplier(phases, phase, 0);
		for (var i=0;i<students.length;i++){
			var yes = (students[i].phases[phase].offer == 1);
			if(yes){
				students = reverse_former_action_and_penalise(phases, phase, students, students[i].phases[phase].target, multiplier)
			}
		}
		return students;
	}
	return null;
}

reverse_former_action_and_penalise = function(phases, phase, students, actor_id, multiplier){
	for (var i=0;i<students.length;i++){ //find the actor...
		if(students[i]._id == actor_id){
			//reverse for them
			var offer = students[i].phases[phase-1].active_income;
			students[i].score -= offer;
			students[i].phases[phase].active_income = -1*offer;
			
			//reverse for their victim
			var target_id = students[i].phases[phase-1].target;			
			for (var j=0;j<students.length;j++){
				if(target_id == students[j]._id){
					var income = students[j].phases[phase-1].passive_income;
					students[j].score -= income;
					students[j].phases[phase].passive_income = -1*offer;
					break;
				}
			}
			break
		}
	}
	return students;
}

initialise_phase = function(phases, phase, students){
	if(phase == -1 || phase > phases.length-1 ){ //psuedo-phases
		return students;
	}
	for (var i=0;i<students.length;i++){
		students[i].phases[phase] = {id: phases[phase].id};
	}
	
	if(_.has(phases[phase].variables, 'target')){ //get each student a target
		if(phases[phase].type == 'Ultimatum' && (phase < 2 || !_.has(phases[phase-1].variables, 'target'))){ //no previous targets, ultimatum doesn't make sense
			return null;
		}
		students = find_targets(phases, phase, students);
	}
	
	if(phases[phase].type == 'Endowment'){
		var multiplier = set_multiplier(phases, phase, 0); //1 is default multiplier, but 0 for endowment phase
		for (var i=0;i<students.length;i++){
			students[i].score += multiplier;
			students[i].phases[phase].passive_income = multiplier;
			students[i].phases[phase].offer = multiplier;
		}
	}
	if(phases[phase].type == 'Dictator'){ //your score
		for (var i=0;i<students.length;i++){
			students[i].phases[phase].max_offer = students[i].score;
		}
	}
	if(phases[phase].type == 'Exploitation'){ //their score / multiplier
				
		for (var i=0;i<students.length;i++){
			
			var actor = _.find(students, function(x) {return x.phases[phase].target == students[i]._id;} );
			students[i].phases[phase].max_offer = actor.score;
		}
	}
	if(phases[phase].type == 'Punishment'){ //their score / multiplier
		for (var i=0;i<students.length;i++){
			students[i].phases[phase].max_offer = students[i].score;
		}	
	}
	students  = set_custom_message(phases, phase, students);
	return students;
}

set_multiplier = function(phases, phase, default_value){
	var multiplier = default_value;
	if(_.has(phases[phase].variables, 'multiplier')){
		multiplier = parseFloat(phases[phase].variables.multiplier);
		if(isNaN(multiplier)) multiplier = default_value;
	}
	return multiplier;
}


update_students = function(students){ //replace each document
	if(students === null) return;
	_.each(students, function(s) {
		Students.update(s._id, s);
	});	
}


advance_phase = function(game, students){
	update_students(finalise_phase(game.phases, game.phase, students))
	game.phase ++;
	update_students(initialise_phase(game.phases, game.phase, students))
	Games.update(game._id, {$set: {phase: game.phase}});
}

Meteor.methods({
		add_student: function(game_id, student_id){			
			if(Students.find(student_id).count() == 1) {return student_id;}
				return Students.insert({
					score: 0,
					game: game_id,
					phases: []
					});
		},		
		advance_phase: function(game_id){
			students = Students.find({game: game_id}).fetch(); //students need to registered to a specific game
			game = Games.findOne({_id: game_id, teacher: this.userId});
			if(game){ advance_phase(game, students);}
		}
});












//examples
if (Students.find().count() === -1) {
	Students.insert({
		offer: 5, 
		partner: {id: 0, offer: 6},
		response: 6,
		received: 12,
		result: 17
		});
}



zz = []
zz[0] = phase_prototypes.Endowment
zz[0].id = 1

zz[1] = phase_prototypes.Dictator
zz[1].id = 2

zz[2] = phase_prototypes.Exploitation
zz[2].id = 3

zz[3] = phase_prototypes.Punishment
zz[3].id = 4


//default game
if (Games.find().count() === 0) {
	Games.insert({
		teacher: '7t4YfbthMi4Z3tpmN',
		name: 'game 1',
		phase: 0,		
		phases: zz,
		});
}













/*	pair_students: function(){
			
			//remove anyone who didn't make an offer
			
			Students.remove({offer:{"$exists":false}});
			
			//pair everyone with a stranger
			var n = Students.find({}).count();
			if(n <2) return;
			var a = _.range(n);
			var b = _.shuffle(a);
			
			for (var i=0;i<n;i++){
				if(a[i] == b[i]){
					var j = i;
					while(j == i){
						j = _.sample(a);
					}
					var swap = b[j];
					b[j] = b[i];
					b[i] = swap;
				}
			}
			
			var students = Students.find().fetch();
			
			for (var i=0;i<n;i++){
				students[i].partner = {
					_id: students[b[i]]._id,
					offer: students[b[i]].offer,
				}
			}
			_.each(students, function(doc) { 
				Students.update(doc._id, doc);
			});			
		},
		compute_results: function(){
			var students = Students.find().fetch();
			_.each(students, function(doc) {
				var response;
				if(_.has(doc, 'response')){ 
					response = doc.response; 
				}
				else{
					response = Students.findOne(doc.partner._id).offer;
				}
				Students.update(doc.partner._id, {$set: {received: response}});
			});			
		}
*/

