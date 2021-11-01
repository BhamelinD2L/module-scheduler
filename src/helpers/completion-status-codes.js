const completionStatusIdConverter = Object.freeze({
	Ids: {
		'1': 'Queued',
		'2': 'Completed',
		'3': 'Failed'
	},
	convertIdToText: function(Id) {
		return this.Ids[Id];
	}
});

export default completionStatusIdConverter;
