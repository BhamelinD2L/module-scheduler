const SCHEDULES_ROUTE = '/d2l/api/custom/modulescheduler/schedules';
const API_VERSION = '1.26';
const D2L_BASE = `/d2l/api/lp/${API_VERSION}`;

export class Routes {
	static AllSchedules() { return `${SCHEDULES_ROUTE}/`; }
	static DeleteSchedule(scheduleId) { return `${SCHEDULES_ROUTE}/${scheduleId}/delete`; }
	static IgnoreList(scheduleId) { return `${SCHEDULES_ROUTE}/${scheduleId}/ignorelist`; }
	static IgnoreListAdd(scheduleId, courseOfferingId) { return `${SCHEDULES_ROUTE}/${scheduleId}/ignorelist/${courseOfferingId}`; }
	static IgnoreListCount(scheduleId) { return `${SCHEDULES_ROUTE}/${scheduleId}/ignorelist/count`; }
	static IgnoreListDelete(scheduleId) { return `${SCHEDULES_ROUTE}/${scheduleId}/ignorelist/delete`; }
	static RunSchedule(scheduleId) { return `${SCHEDULES_ROUTE}/${scheduleId}/run`; }
	static SaveNewSchedule() { return SCHEDULES_ROUTE; }
	static Schedule(scheduleId) { return `${SCHEDULES_ROUTE}/${scheduleId}`; }
	static SemesterOrgUnitType() { return `${D2L_BASE}/outypes/semester`; }
	static Semesters() { return `${D2L_BASE}/orgstructure/`; }
	static UpdateSchedule(scheduleId) { return `${SCHEDULES_ROUTE}/${scheduleId}/update`; }
}
