import { Requests } from '../api/requests.js';

export class ScheduleService {
	static async getAllSchedules() {
		const allSchedules = await Requests.getAllSchedules();
		return allSchedules;
	}

	static async getIgnoreList(scheduleId) {
		const ignoreList = await Requests.getIgnoreList(scheduleId);
		return ignoreList;
	}

	static async runSchedule(scheduleId) {
		await Requests.runSchedule(scheduleId);
	}
}
