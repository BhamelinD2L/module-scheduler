import { Requests } from '../api/requests.js';

export class ScheduleService {
	static async createSchedule(schedule) {
		await Requests.postSchedule(schedule);
		return;
	}

	static async deleteSchedule(scheduleId) {
		await Requests.deleteSchedule(scheduleId);
	}

	static async getAllSchedules() {
		const allSchedules = await Requests.getAllSchedules();
		return allSchedules;
	}

	static async getIgnoreList(scheduleId, search, pageSize, pageNumber) {
		return await Requests.getIgnoreList(scheduleId, search, pageSize, pageNumber);
	}

	static async getIgnoreListCount(scheduleId, search) {
		return await Requests.getIgnoreListCount(scheduleId, search);
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

}
