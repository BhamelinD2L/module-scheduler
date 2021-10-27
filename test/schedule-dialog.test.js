import '../src/components/module-scheduler-schedule-dialog.js';
import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('ScheduleDialog', () => {

	describe('accessibility', () => {
		it('should pass all aXe tests', async() => {
			const el = await fixture(html`<module-scheduler-schedule-dialog openScheduleDialog></module-scheduler-schedule-dialog>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('module-scheduler-schedule-dialog');
		});
	});

});
