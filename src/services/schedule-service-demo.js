export class ScheduleServiceDemo {

	static schedules = [
		{
			scheduleId: 1,
			scheduleName: 'Math',
			courseOfferingSemesterId: '10101',
			courseOfferingSessionCodeFilter: 'S100',
			courseOfferingSubjectCodeFilter: 'Math101',
			moduleNameIgnoreList: 'Eng',
			scheduleJson: '',
			createdByUserId: 1,
			createdDate: '2021-06-01T19:57:39.290Z',
			lastRunDate: '2021-07-01T19:57:39.290Z'
		},
		{
			scheduleId: 2,
			scheduleName: 'English',
			courseOfferingSemesterId: '10007',
			courseOfferingSessionCodeFilter: 'S100',
			courseOfferingSubjectCodeFilter: 'Eng101',
			moduleNameIgnoreList: 'Math',
			scheduleJson: '',
			createdByUserId: 1,
			createdDate: '2021-06-01T19:57:39.290Z',
			lastRunDate: '2021-07-01T19:57:39.290Z'		}
	];

	static async getAllSchedules() {
		return this.schedules;
	}
}
