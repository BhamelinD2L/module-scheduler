import '../src/components/module-scheduler-ignore-list.js';
import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('ModuleSchedulerManager', () => {

	describe('accessibility', () => {
		it('should pass all aXe tests', async() => {
			const el = await fixture(html`<module-scheduler-ignore-list scheduleId="1" scheduleName="Math"></module-scheduler-ignore-list>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('module-scheduler-ignore-list');
		});
	});

});
