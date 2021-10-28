import './module-scheduler-ignore-list.js';
import './module-scheduler-manager.js';
import { css, html, LitElement } from 'lit-element/lit-element';
import { AppRoutes } from '../helpers/app-routes.js';
import { LocalizeMixin } from '../mixins/localize-mixin.js';
import page from 'page';

class ModuleSchedulerRouter extends LocalizeMixin(LitElement) {

	static get properties() {
		return {
			page: { type: String },
			pageData: { type: Object },
			params: { type: Object }
		};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
		`;
	}

	constructor() {
		super();
		this.page = AppRoutes.Home();
		this.pageData = null;

		this.initializeRouter();
	}

	render() {
		switch (this.page) {
			case AppRoutes.Home(): {
				return html`
					<module-scheduler-manager></module-scheduler-manager>
				`;
			}
			case AppRoutes.IgnoreList(): {
				const scheduleName = this.pageData.schedule ? this.pageData.schedule.scheduleName : null;
				const scheduleId = this.params.scheduleId;

				return html`
					<module-scheduler-ignore-list scheduleId="${scheduleId}" scheduleName="${scheduleName}"></module-scheduler-ignore-list>
				`;
			}
		}
	}

	async initializeRouter() {
		// Set up routes
		page(AppRoutes.Home(), this._genNavCallback(AppRoutes.Home()));
		page(AppRoutes.IgnoreList(), this._genNavCallback(AppRoutes.IgnoreList()));

		page();
	}

	_genNavCallback(page) {
		return (context) => {
			this.page = page;
			this.pageData = context.state;
			this.params = context.params;
		};
	}

}
customElements.define('module-scheduler-router', ModuleSchedulerRouter);
