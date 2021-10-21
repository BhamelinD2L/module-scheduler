export class Routes {
	static AllSchedules() { return '/d2l/api/custom/modulescheduler/schedules/'; }
	static RunSchedule(scheduleId) { return `/d2l/api/custom/modulescheduler/schedules/${scheduleId}/run`; }
}
