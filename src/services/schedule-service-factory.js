import { ScheduleService } from './schedule-service.js';
import { ScheduleServiceDemo } from './schedule-service-demo.js';

export class ScheduleServiceFactory {
	static getScheduleService() {
		if (window.demo) {
			return ScheduleServiceDemo;
		}
		return ScheduleService;
	}
}
