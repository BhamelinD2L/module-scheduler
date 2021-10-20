import { Requests } from '../api/requests.js';

export class ScheduleService {
	static async getAllSchedules() {
		const allSchedules = await Requests.getAllSchedules();
		return allSchedules;
	}

	static async getSemesters() {
		const semester = await Requests.getSemesters();
		return semester;
	}

}
