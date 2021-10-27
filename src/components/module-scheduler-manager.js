import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import '@brightspace-ui/core/components/dropdown/dropdown-content.js';
import '@brightspace-ui/core/components/dropdown/dropdown-context-menu.js';
import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';
import '@brightspace-ui/core/components/overflow-group/overflow-group.js';
import './module-scheduler-schedule-dialog.js';
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
			},
			showScheduleDialog: {
				type: Boolean
			},
			openDialog: {
				type: Boolean
			},
			_scheduleId: {
				type: String
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
				.d2l-page-description {
					margin: 0;
				}
				.d2l-spinner {
					display: flex;
					margin: 48px;
				}
				.d2l-add-new-btn {
					margin: 5px 0;
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
		this.showScheduleDialog = false;
		this.openDialog = false;
		this._scheduleId = '';
	}

	async connectedCallback() {
		super.connectedCallback();

		this.isLoading = true;
		await this._queryAllSchedules();
		this.isLoading = false;
	}

	render() {
		return html`
			${ this.showScheduleDialog ? this._renderAddEditScheduleDialog() : null }
			<h2>${ this.localize('page:title') }</h2>
			<p class="d2l-page-description">${ this.localize('page:description') }</p>
			<d2l-button-subtle
				class="d2l-add-new-btn"
				@click="${this._openScheduleDialog}"
				icon="tier1:plus-large-thick"
				text=${ this.localize('page:addNewButton') }>
			</d2l-button-subtle>
			${ this.isLoading ? this._renderSpinner() : this._renderTable() }
		`;
	}

	_closeScheduleDialog() {
		this.showScheduleDialog = false;
	}

	async _handleApplyNow() {
		const schedule = this.allSchedules.find(schedule => schedule.scheduleId === this._scheduleId);

		await this.scheduleService.runSchedule(this._scheduleId);

		schedule.lastRunDate = this.localize('status:processing');

		this.requestUpdate();

		this.openDialog = false;
	}

	_handleWarningDialogClose() {
		this.dispatchEvent(new CustomEvent('close'));
		this.openDialog = false;
	}

	_handleWarningDialogOpen(event) {
		this.openDialog = true;
		this._scheduleId = event.target.getAttribute('schedule-id');
	}

	_openScheduleDialog() {
		this.showScheduleDialog = true;
	}

	async _queryAllSchedules() {
		this.isQuerying = true;
		this.allSchedules = await this.scheduleService.getAllSchedules();
		this.isQuerying = false;
	}

	_renderAddEditScheduleDialog(scheduleId = null) {
		return html`
			<module-scheduler-schedule-dialog
				scheduleId=${scheduleId}
				@schedule-dialog-closed=${this._closeScheduleDialog}>
				>
			</module-scheduler-schedule-dialog>
		`;
	}

	_renderContextMenu(scheduleId) {
		return html`
			<d2l-dropdown-context-menu>
				<d2l-dropdown-menu>
					<d2l-menu label="${this.localize('contextMenu:label')}">
						<d2l-menu-item text="${this.localize('contextMenu:edit')}"></d2l-menu-item>
						<d2l-menu-item text="${this.localize('contextMenu:viewIgnoreList')}"></d2l-menu-item>
						<d2l-menu-item
							schedule-id="${ scheduleId }"
							text="${this.localize('contextMenu:applyNow')}"
							@d2l-menu-item-select=${this._handleWarningDialogOpen}
						>
						</d2l-menu-item>
					</d2l-menu>
				</d2l-dropdown-menu>
			</d2l-dropdown-context-menu>
		`;
	}

	_renderSchedule(schedule) {
		let lastDateApplied = schedule.lastRunDate === null ? this.localize('status:processing') : schedule.lastRunDate;

		lastDateApplied = lastDateApplied !== this.localize('status:processing')
			? getDateFromISODateTime(schedule.lastRunDate).toLocaleString()
			: schedule.lastRunDate;

		return html`
			<tr>
				<td>
					${schedule.scheduleName}
					${this._renderContextMenu(schedule.scheduleId)}
				</td>
				<td>${schedule.courseOfferingSemesterName}</td>
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
						<th>${this.localize('tableHeader:scheduleName')}</th>
						<th>${this.localize('tableHeader:semester')}</th>
						<th>${this.localize('tableHeader:session')}</th>
						<th>${this.localize('tableHeader:subject')}</th>
						<th>${this.localize('tableHeader:lastDateApplied')}</th>
					</thead>
					<tbody>
						${ this.isQuerying ? '' : this.allSchedules.map(schedule => this._renderSchedule(schedule)) }
					</tbody>
				</table>

			${this._renderWarningDialog()}
		`;
	}

	_renderWarningDialog() {
		return html`
			<d2l-dialog
		        title-text="${this.localize('warningDialog:title')}"
				?opened=${this.openDialog}
				@d2l-dialog-close=${this._handleWarningDialogClose}
			>
				<div>
					<p>${this.localize('warningDialog:content')}<p>
				</div>
				<d2l-button slot="footer" primary @click=${this._handleApplyNow}>
					${this.localize('button:yes')}
				</d2l-button>
				<d2l-button slot="footer" data-dialog-action>
					${this.localize('button:no')}
				</d2l-button>
			</d2l-dialog>
		`;
	}

}
customElements.define('module-scheduler-manager', ModuleSchedulerManager);

