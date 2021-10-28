export class Routes {
	static AllSchedules() { return '/d2l/api/custom/modulescheduler/schedules/'; }
	static IgnoreList(scheduleId) { return `/d2l/api/custom/modulescheduler/schedules/${scheduleId}/ignorelist`; }
	static RunSchedule(scheduleId) { return `/d2l/api/custom/modulescheduler/schedules/${scheduleId}/run`; }
}
