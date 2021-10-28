export class AppRoutes {
	static Base() { return '/d2l/custom/modulescheduler'; }
	static Home() { return `${AppRoutes.Base()}/`; }
	static IgnoreList(scheduleId = ':scheduleId') { return `${AppRoutes.Base()}/${scheduleId}/ignorelist`; }
}
