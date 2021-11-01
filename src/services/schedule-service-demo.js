export class ScheduleServiceDemo {

	static async createSchedule() {}

	static async getAllSchedules() {
		return this.schedules;
	}

	static async getIgnoreList() {
		return this.ignoreListItems;
	}

	static async getSchedule(scheduleId) {
		const schedule = this.schedules.find(x => x.scheduleId === scheduleId);
		return (schedule || this.schedules[0]);
	}

	static async getSemesters() {
		return this.semesters;
	}

	static ignoreListItems = [
		{
			'scheduleId': '1',
			'courseOfferingId': '1010',
			'courseOfferingName': 'Math 1',
			'courseOfferingCode': 'MATH_100_S001_SP22',
			'lastDateApplied': '2021-07-01T19:57:39.290Z',
			'lastCompletionStatusId': '2'
		}
	];

	static schedules = [
		{
			scheduleId: '1',
			scheduleName: 'Math',
			courseOfferingSemesterId: '10101',
			courseOfferingSemesterName: 'Fall',
			courseOfferingSessionCodeFilter: 'S100',
			courseOfferingSubjectCodeFilter: 'Math101',
			moduleNameIgnoreList: 'Eng',
			scheduleJson: '',
			createdByUserId: 1,
			createdDate: '2021-06-01T19:57:39.290Z',
			lastRunDate: '2021-07-01T19:57:39.290Z'
		},
		{
			scheduleId: '2',
			scheduleName: 'English',
			courseOfferingSemesterId: '10007',
			courseOfferingSemesterName: 'Spring',
			courseOfferingSessionCodeFilter: 'S100',
			courseOfferingSubjectCodeFilter: 'Eng101',
			moduleNameIgnoreList: 'Math',
			scheduleJson: '',
			createdByUserId: 1,
			createdDate: '2021-06-01T19:57:39.290Z',
			lastRunDate: null
		},
		{
			scheduleId: '3',
			scheduleName: 'Math',
			courseOfferingSemesterId: '10001',
			courseOfferingSemesterName: 'Winter',
			courseOfferingSessionCodeFilter: 'S100',
			courseOfferingSubjectCodeFilter: 'Math101',
			moduleNameIgnoreList: 'Eng',
			scheduleJson: '',
			createdByUserId: 1,
			createdDate: '2021-06-01T19:57:39.290Z',
			lastRunDate: 'Processing'
		}
	];

	static semesters = [
		{
			'Identifier': '10001',
			'Name': 'Fall'
		},
		{
			'Identifier': '10007',
			'Name': 'Winter'
		},
		{
			'Identifier': '10101',
			'Name': 'Spring'
		}
	];

	static async runSchedule() {}

	static async updateSchedule() {}
}
