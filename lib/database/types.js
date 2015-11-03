game_prototype = {
	teacher: null,
	name: 'default game name',
	phase: -1,
	phases: [],
	playing: false
};



phase_types = {
	Endowment: {label: "Endowment",	callback: function(){add_phase('Endowment') 	}},
	Dictator: {label: "Dictator",	callback: function(){add_phase('Dictator') 	}},
	Exploitation: {label: "Exploitation",	callback: function(){add_phase('Exploitation') 	}},
	Punishment: {label: "Punishment",	callback: function(){add_phase('Punishment') 	}},	
}

phase_prototypes = {
	'Login': {
		id:-1,
		type: 'Login',
		variables: {
			message: ' '
		}
	},
	'Results': {
		id:9999,
		type: 'Results',
		variables: {
			message: ' '
		}
	},
	'Endowment': {
		type: 'Endowment',
		variables: {
			message: '',
			multiplier: ''
			}
	},	
	'Dictator': {
		type: 'Dictator',
		variables: {
			message: '',
			multiplier: '',
			target: 'Random' //or Repeat, Reciprocate
			}
	}, 
	'Exploitation': {
		type: 'Exploitation',
		variables: {
			message: '',
			multiplier: '',
			target: 'Random'
			}
	}, 
	'Punishment': {
		type: 'Punishment',
		variables: {
			message: '',
			multiplier: '',
			target: 'Random'
			}
	}, 
/*	'Ultimatum': {
		type: 'Ultimatum',
		variables: {
			message: '',
			multiplier: '',
			target: 'Random'
			}
	},*/
}

phase_help = {
	 'Endowment': '<p>Students are shown {message} and {multiplier} points are added to their score.</p>',
	 
	 'Dictator': '<p>Each student may give an integer-valued number number of points, between zero and their current score, to their {target}. Their target recieves that number multiplied by {multiplier}, rounded to the nearest integer. </p><p>If you do not specify a number in the {multiplier} field, a multiplier of 1 will be assumed.</p>',
	 
	 'Exploitation': "<p>Each student may take an integer-valued number number of points from their {target}, between zero and their target's current score. Their target loses that number, while they gain {multiplier} times as many, rounded to the nearest integer.</p><p> If you do not specify a number in the {multiplier} field, a multiplier of 1 will be assumed.</p>",
	 
	 'Punishment': "<p>Each may pay an integer-valued number of points to take {multiplier} times as many points from their target (rounded to the nearest integer). The maximum they can pay is the own score, so they could push the target into negatives (especially if the target is simultaneously paying to punish someone else).</p><p> If you do not specify a number in the {multiplier} field, a multiplier of 1 will be assumed.</p>",	 
	 
	 'Ultimatum':"<p><strong>WARNING: BETA!</strong> It's a little convoluted implementing an ultimatum game in the current system. Here's an attempted at providing the basic functionality, but it's not thoroughly tested so use it at your own risk.</p><p>Each student will see two buttons 'Yes' and 'No'. It is up to you to explain in your {message} what these buttons do. </p><p>If they click 'No', nothing happens. Pressing 'Yes' is a little more involved. </p><p>Let's define three individuals: ego (the player making this choice), actor (ego's current target), and victim (actor's target in the previous round). If you set {target} to 'Reciprocate', then ego = victim (which really makes the most sense here). </p><p> A 'Yes' choice reverses actor's previous action on victim and subtracts a fixed number of points from actor.  </p><p> Any points actor gave to victim are subtracted from victim and refunded to actor. Any points they took from victim are restored. Et cetera. </p><p> Additionally, {multiplier} points are subtracted from actor. In this phase, {multiplier} is a fixed, constant amount. </p><p>So, for example, to create a classic ultimatum game you'd have: an Edownment phase with {multiplier} = 100, a dictator phase with {target} = Random, followed by an Ultimatum phase with {target} = Reciprocate and also with {multiplier} = 100. In this classic ultimatum scenario, you may want to emphasise to students in your message that random target assignment means that the person they made an offer to is very likely (with probability (n-2)/(n-1) ) not the same person who made an offer to them.</p> <p> Of course, you could also use this for many other creative designs. Say, as a kind of 'third party nuke' by setting {target} to Random and {multiplier} very large. Or here's an idea:  have a game where everyone can steal from each other (Exploit phase) with a positive multiplier (say, the thief gets double), then have a second-person denial option (Ultimatum phase with {target} = Reciprocate and {multiplier} = 0). The collective optimum is to all steal the maximum amount from each other and hit 'No' on the ultimatum option, but I'll bet that's not what happens.</p>",
}


target_help_string = "<p>In this phase each student's choice will affect a *target*. This target will either be allocated randomly (Random), be the same target they had in the previous round (Repeat) or be the person who's target they were (i.e., who acted upon them) in the previous round (Reciprocate). </p><p> If there were no targets in the previous round (e.g., it was an endowment round) the system will ignore 'Repeat' and 'Reciprocate' and just allocate a random target. </p><p> For example, if you want create a class 'trust game', you would set a Dictator round with a Random target, followed by a Dictator round with a Reciprocate target.</p>";


message_help_string = "<p>Each student will see the message that you write here. Besides allocation sliders or buttons, they will not be given any information besides whatever you put here, so make it informative.</p><p> You can include some special fields in this message which will be replaced with information about the student's previous acts and consequences, and those of their current target. </p><p> [score] will show their current score and [target_score] will be their target's current score. </p><p> [act] (and, respectively, [target_act]) will show the amount they and their target gained or lost in the previous round due to their own action.</p><p> [consequence] and [target_consequence] will show the amount they and their current target received/lost due to someone else's action.</p> <p>While [score] and [target_score] only ever refer to the current scores, you can refer to the acts and consequences an arbitrary number of rounds back by using the format: [variable:rounds]. For example, to refer to the amount they received 3 rounds ago, you would use: [consequence:3]; or how much their current target gave 5 rounds ago would be: [target_act:5].</p><p>If for some reason any of the corresponding values don't exist (e.g., it's the first round, or the corresponding round was an endowment round and so had no targets, etc.), these variables will simply be deleted from the message.</p> <p> Here's an example of what your message could say:</p><p style='padding-left:2em;'><small>Last round you chose to give [act] points and received [consequence] points from someone else. The round before that you stole [act:2] points, and someone else stole [consequence:2] points from you. Now you've been randomly assigned to evaluate the actions of one other student. That student chose to give [target_act] points in the previous round, and they received [target_consequence] points from someone else. The round before that they stole [target_act:2] points and had [target_consequence:2] points stolen.... etc.</small></p>";

multiplier_help_string = "<p>Each student's action will be multiplied by this amount before it affects their target. This can be any real number, but keep in mind that the scoring system only works with integers (trust me, trying to implement real-valued sliders for the students to make choices with is more pain than either of us want invite) so the result will be rounded to the nearest integer. </p><p> For Dictator and Punishment  phases, you probably want an amount equal to or greater than 1. </p><p>For Exploitation phases, you probably want an amount less than one. </p><p>In Endowment phases, this just specifies the amount each student receives (rounded to the nearest integer). An Endowment phase with multiplier zero is a good way to just send students a message.</p>";



















default_game_dictator = {
	teacher: null,
	name: 'Dictator Game Example',
	phase: -1,
	phases: [
		{
			id: 1,
			type: 'Endowment',
			variables: {
			message: 'You have been given 100 points.',
			multiplier: 100
			}
		},
		{
			id: 2,
			type: 'Dictator',
			variables: {
			message: 'You have been randomly assigned to one other individual. You can give them any number of your points. Anything you give them will be doubled, so if you give them 5, they will receive 10; if you give 50, they will receive 100, and so on.\n\n Another person has been assigned to make the same decision about how many points to give you. \n\n Assignment is completely random, so it is unlikely (though possible) that you are giving points to the same person who is giving points to you.',
			multiplier: '2',
			target: 'Random' //or Repeat, Reciprocate
			}
		}
	],
	playing: false
}


default_game_trust = {
	teacher: null,
	name: 'Trust Game Example',
	phase: -1,
	phases: [
		{
			id: 1,
			type: 'Endowment',
			variables: {
			message: 'You have been given 100 points.',
			multiplier: 100
			}
		},
		{
			id: 2,
			type: 'Dictator',
			variables: {
			message: 'You have been randomly assigned to one other individual. You can give them any number of your points. Anything you give them will be doubled, so if you give them 5, they will receive 10; if you give 50, they will receive 100, and so on.\n\n Another person has been assigned to make the same decision about how many points to give you. \n\n Assignment is completely random, so it is unlikely (though possible) that you are giving points to the same person who is giving points to you. \n\n Afterwards, the person who you gave points to will be able to give any number of points back to you, which will also be doubled. The more point you give them, the more they will be able to give back, but they might choose not to give back any. You will, similarly, be able to give points back to the person who is currently deciding how many points to give you.',
			multiplier: '2',
			target: 'Random' //or Repeat, Reciprocate
				}
		},
		{
			id: 3,
			type: 'Dictator',
			variables: {
			message: 'You gave away [act] points, which caused someone else to receive double that amount. Meanwhile you recived given [consequence] points because someone else paid [target_act] points. You now have [score] points. \n\n Now you can give any number of points back to the person who decided to give you [target_act] points. Just like last time, any points you give back will be doubled.',
			multiplier: '2',
			target: 'Reciprocate' //or Repeat, Reciprocate
			}
		},
	],
	playing: false
}

default_game_threepp = {
	teacher: null,
	name: '3PP Game Example',
	phase: -1,
	phases: [
		{
			id: 1,
			type: 'Endowment',
			variables: {
			message: 'You have been given 100 points.',
			multiplier: 100
			}
		},
		{
			id: 2,
			type: 'Dictator',
			variables: {
			message: "You have been randomly assigned to one other individual. You can give them any number of your points. Anything you give them will be doubled, so if you give them 5, they will receive 10; if you give 50, they will receive 100, and so on.\n\n Another person has been assigned to make the same decision about how many points to give you. \n\n Assignment is completely random, so it is unlikely (though possible) that you are giving points to the same person who is giving points to you. \n\n In the next round each student, including you, will be again randomly assigned to another student. They will be able to see how many points that student gave in this round, and will be able to pay as many points as they like to have twice as many points deducted from that student's score.",
			multiplier: '2',
			target: 'Random' //or Repeat, Reciprocate
			}
		},
		{
			id: 3,
			type: 'Punishment',
			variables: {
				message: "You gave away [act] points, which caused someone else to receive double that amount. Meanwhile you received [consequence] points because someone else chose to pay half that amount. You now have [score] points. \n\n You have been randomly assigned to one other student. That student gave [target_act] points and recieved [target_consequence] points. \n\n Now you can pay any number of points to decrease this student's score by two points for every point you pay. How many poins would you like to deduct?",
				multiplier: '2',
				target: 'Random' //or Repeat, Reciprocate
				}
		},
	],
	playing: false
}

default_games = [default_game_dictator, default_game_trust, default_game_threepp];



