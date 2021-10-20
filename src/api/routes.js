const semesterApiVersion = '1.26';

export class Routes {
	static AllSchedules() { return '/d2l/api/custom/modulescheduler/schedules/'; }
	static Semesters() { return `/d2l/api/lp/${semesterApiVersion}/enrollments/myenrollments/?orgUnitTypeId=5`; }
}
