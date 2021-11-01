const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe('module-scheduler-manager', () => {

	const visualDiff = new VisualDiff('module-scheduler-manager', __dirname);

	let browser, page;

	before(async() => {
		browser = await puppeteer.launch();
		page = await visualDiff.createPage(browser);
		await page.goto(`${visualDiff.getBaseUrl()}/test/module-scheduler-manager.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
	});

	beforeEach(async() => {
		await visualDiff.resetFocus(page);
	});

	after(async() => await browser.close());

	it('passes visual-diff comparison', async function() {
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle());
	});

});
