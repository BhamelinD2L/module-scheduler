export class ScheduleServiceDemo {

	static schedules = [
		{
			ScheduleId: 1,
			ScheduleName: 'Math',
			CourseOfferingSemesterId: 100,
			CourseOfferingSessionCodeFilter: 'S100',
			CourseOfferingSubjectCodeFilter: 'Math101',
			ModuleNameIgnoreList: 'Eng',
			ScheduleJson: '',
			CreatedByUserId: 1,
			CreatedDate: '2021-06-01T19:57:39.290Z',
			LastRunDate: '2021-07-01T19:57:39.290Z'
		},
		{
			ScheduleId: 2,
			ScheduleName: 'English',
			CourseOfferingSemesterId: 100,
			CourseOfferingSessionCodeFilter: 'S100',
			CourseOfferingSubjectCodeFilter: 'Eng101',
			ModuleNameIgnoreList: 'Math',
			ScheduleJson: '',
			CreatedByUserId: 1,
			CreatedDate: '2021-06-01T19:57:39.290Z',
			LastRunDate: '2021-07-01T19:57:39.290Z'		}
	];

	static async getAllSchedules() {
		return this.schedules;
	}
}
