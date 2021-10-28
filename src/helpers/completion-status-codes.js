const completionStatusIdConverter = Object.freeze({
	codes: {
		'1': 'Queued',
		'2': 'Completed',
		'3': 'Failed'
	},
	convertIdText: function(code) {
		return this.codes[code];
	}
});

export default completionStatusIdConverter;
