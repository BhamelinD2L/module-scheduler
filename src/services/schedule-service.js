import { Requests } from '../api/requests.js';

export class ScheduleService {
	static async createSchedule(schedule) {
		await Requests.postSchedule(schedule);
		return;
	}

	static async getAllSchedules() {
		const allSchedules = await Requests.getAllSchedules();
		return allSchedules;
	}

	static async getIgnoreList(scheduleId) {
		const ignoreList = await Requests.getIgnoreList(scheduleId);
		return ignoreList;
	}

	static async getSchedule(scheduleId) {
		const schedule = await Requests.getSchedule(scheduleId);
		return schedule;
	}

	static async getSemesters() {
		const semesters = await Requests.getSemesters();
		return semesters.Items;
	}

	static async runSchedule(scheduleId) {
		await Requests.runSchedule(scheduleId);
	}

	static async updateSchedule(scheduleId, schedule) {
		await Requests.putSchedule(scheduleId, schedule);
		return;
	}

	static async deleteSchedule(scheduleId) {
		await Requests.deleteSchedule(scheduleId);
	}
}
