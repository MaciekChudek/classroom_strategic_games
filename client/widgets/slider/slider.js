
Template.slider.helpers({
	range: function(){
		var min = 0; 
		var max = 10;
		if(this.min_range){min = this.min_range;}
		if(this.max_range){max = this.max_range;}
		Session.set(this.id, min);
		return min + ',' + max;		
	},
	has_range: function(){
		if (!_.has(this, 'max_range') || this.max_range != 0)return true;
		//Session.set(this.id, 0);
		return false;
	}
});

Template.slider.rendered = function() {			
	if(typeof this.data.id !== 'undefined'){
		slider = draw_sliders(this.find('[data-slider]'));
		slider.id = this.data.id;
		
		slider.bind("slider:ready slider:changed", function (event, data) {				
			  Session.set(data.id, data.value)
			});
	}
}
