import '@brightspace-ui/core/components/dropdown/dropdown-content.js';
import '@brightspace-ui/core/components/dropdown/dropdown-context-menu.js';
import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';
import '@brightspace-ui/core/components/overflow-group/overflow-group.js';
import { css, html, LitElement } from 'lit-element/lit-element';
import { getDateFromISODateTime } from '@brightspace-ui/core/helpers/dateTime.js';
import { heading1Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeMixin } from '../mixins/localize-mixin.js';
import { ScheduleServiceFactory } from '../services/schedule-service-factory.js';
import { tableStyles } from '@brightspace-ui/core/components/table/table-wrapper.js';

class ModuleSchedulerManager extends LocalizeMixin(LitElement) {

	static get properties() {
		return {
			isLoading: {
				type: Boolean
			},
			isQuerying: {
				type: Boolean
			},
			allSchedules: {
				type: Array
			}
		};
	}

	static get styles() {
		return [
			heading1Styles,
			tableStyles,
			css`
				:host {
					display: inline-block;
				}

				:host([hidden]) {
					display: none;
				}

				.d2l-spinner {
					display: flex;
					margin: 48px;
				}
			`
		];
	}

	constructor() {
		super();

		this.scheduleService = ScheduleServiceFactory.getScheduleService();

		this.isLoading = true;
		this.isQuerying = false;
		this.allSchedules = [];
	}

	async connectedCallback() {
		super.connectedCallback();

		this.isLoading = true;
		await this._queryAllSchedules();
		this.isLoading = false;
	}

	render() {
		return html`
			<h2>${ this.localize('pageTitle') }</h2>
			<p>${ this.localize('pageDescription') }</p>
			${ this.isLoading ? this._renderSpinner() : this._renderTable() }
		`;
	}

	async _queryAllSchedules() {
		this.isQuerying = true;
		this.allSchedules = await this.scheduleService.getAllSchedules();
		this.isQuerying = false;
	}

	_renderContextMenu() {
		return html`
			<d2l-dropdown-context-menu>
				<d2l-dropdown-menu>
					<d2l-menu>
						<d2l-menu-item text="${this.localize('editMenu')}"></d2l-menu-item>
						<d2l-menu-item text="${this.localize('viewIgnoreListMenu')}"></d2l-menu-item>
						<d2l-menu-item text="${this.localize('applyNowMenu')}"></d2l-menu-item>
					</d2l-menu>
				</d2l-dropdown-menu>
			</d2l-dropdown-context-menu>
		`;
	}

	_renderSchedule(schedule) {
		const lastDateApplied = schedule.lastRunDate ? getDateFromISODateTime(schedule.lastRunDate).toLocaleString() : null;
		return html`
			<tr>
				<td>
					${schedule.scheduleName}
					${this._renderContextMenu()}
				</td>
				<td>${schedule.courseOfferingSemesterId}</td>
				<td>${schedule.courseOfferingSessionCodeFilter}</td>
				<td>${schedule.courseOfferingSubjectCodeFilter}</td>
				<td>${lastDateApplied}</td>
			</tr>
		`;
	}

	_renderSpinner() {
		return html`
			<d2l-loading-spinner
				class="d2l-spinner"
				size=100>
			</d2l-loading-spinner>
		`;
	}

	_renderTable() {
		return html`
			<d2l-table-wrapper sticky-headers>
				<table class="d2l-table">
					<thead>
						<th>${this.localize('scheduleNameTableHeader')}</th>
						<th>${this.localize('semesterTableHeader')}</th>
						<th>${this.localize('sessionTableHeader')}</th>
						<th>${this.localize('subjectTableHeader')}</th>
						<th>${this.localize('lastDateAppliedTableHeader')}</th>
					</thead>
					<tbody>
						${ this.isQuerying ? '' : this.allSchedules.map(schedule => this._renderSchedule(schedule)) }
					</tbody>
				</table>
		`;
	}

}
customElements.define('module-scheduler-manager', ModuleSchedulerManager);
