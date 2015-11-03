get_phase = function(phases, phase_id){
	return _.find(phases, function(phase) {return phase.id == phase_id;}); 
}



UI.registerHelper('truncated_id', function(n, id){
	if(typeof n == 'undefined') n = 5;
	if(typeof id == 'undefined'){
		 if(typeof this == 'undefined') return '';
		 if(_.has(this, 'id')) id = this.id;
		 if(_.has(this, '_id')) id = this._id;
		 if(_.has(this, 'student') && (typeof this.student != 'undefined') && _.has(this.student, '_id')) id = this.student._id;
		 if(_.has(this, 'game')  && (typeof this.game != 'undefined') && _.has(this.game, '_id')) id = this.game._id;
		 
		 if(typeof id == 'undefined') return '';
	 }
	 if(typeof id != 'string') return '';
	return id.substring(0,n);
})
