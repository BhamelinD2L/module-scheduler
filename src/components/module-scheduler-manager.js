import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import '@brightspace-ui/core/components/dropdown/dropdown-content.js';
import '@brightspace-ui/core/components/dropdown/dropdown-context-menu.js';
import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';
import '@brightspace-ui/core/components/overflow-group/overflow-group.js';
import './module-scheduler-schedule-dialog.js';
import { css, html, LitElement } from 'lit-element/lit-element';
import { AppRoutes } from '../helpers/app-routes.js';
import { BaseMixin } from '../mixins/base-mixin.js';
import { getDateFromISODateTime } from '@brightspace-ui/core/helpers/dateTime.js';
import { heading1Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { ifDefined } from 'lit-html/directives/if-defined';
import { LocalizeMixin } from '../mixins/localize-mixin.js';
import { renderSpinner } from '../helpers/spinner.js';
import { ScheduleServiceFactory } from '../services/schedule-service-factory.js';
import { tableStyles } from '@brightspace-ui/core/components/table/table-wrapper.js';

class ModuleSchedulerManager extends BaseMixin(LocalizeMixin(LitElement)) {

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
			openApplyNowDialog: {
				type: Boolean
			},
			openDeleteDialog: {
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
		this.openApplyNowDialog = false;
		this.openDeleteDialog = false;
		this._scheduleId = null;
	}

	async connectedCallback() {
		super.connectedCallback();
		await this._loadSchedules();
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
			${ this.isLoading ? renderSpinner() : this._renderTable() }
		`;
	}

	async _closeScheduleDialog() {
		this.showScheduleDialog = false;
		await this._loadSchedules();
	}

	async _handleApplyNow() {
		const schedule = this.allSchedules.find(schedule => schedule.scheduleId === this._scheduleId);

		await this.scheduleService.runSchedule(this._scheduleId);

		schedule.lastRunDate = this.localize('status:processing');

		this.requestUpdate();

		this.openApplyNowDialog = false;
	}

	async _handleDelete() {
		await this.scheduleService.deleteSchedule(this._scheduleId);
		this.openDeleteDialog = false;
	}

	async _handleDeleteWarningDialogClose() {
		this.openDeleteDialog = false;
		this.dispatchEvent(new CustomEvent('close'));
		await this._loadSchedules();
	}

	_handleDeleteWarningDialogOpen(event) {
		this.openDeleteDialog = true;
		this._scheduleId = event.target.getAttribute('schedule-id');
	}

	_handleEditSchedule(event) {
		this._scheduleId = event.target.getAttribute('schedule-id');
		this.showScheduleDialog = true;
	}

	_handleIgnoreListSelect(event) {
		const scheduleId = event.target.getAttribute('schedule-id');
		const schedule = this.allSchedules.find(schedule => schedule.scheduleId === scheduleId);
		this.navigateTo(AppRoutes.IgnoreList(scheduleId), { scheduleName: schedule.scheduleName });
	}

	_handleWarningDialogClose() {
		this.dispatchEvent(new CustomEvent('close'));
		this.openApplyNowDialog = false;
	}

	_handleWarningDialogOpen(event) {
		this.openApplyNowDialog = true;
		this._scheduleId = event.target.getAttribute('schedule-id');
	}

	async _loadSchedules() {
		this.isLoading = true;
		await this._queryAllSchedules();
		this.isLoading = false;
	}

	_openScheduleDialog() {
		this._scheduleId = null;
		this.showScheduleDialog = true;
	}

	async _queryAllSchedules() {
		this.isQuerying = true;
		this.allSchedules = await this.scheduleService.getAllSchedules();
		this.isQuerying = false;
	}

	_renderAddEditScheduleDialog() {
		return html`
			<module-scheduler-schedule-dialog
				scheduleId=${ifDefined(this._scheduleId || undefined)}
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
						<d2l-menu-item
							schedule-id="${ scheduleId }"
							text="${this.localize('contextMenu:edit')}"
							@d2l-menu-item-select=${this._handleEditSchedule}
						>
						</d2l-menu-item>
						<d2l-menu-item
							schedule-id="${ scheduleId }"
							text="${this.localize('contextMenu:viewIgnoreList')}"
							@d2l-menu-item-select=${this._handleIgnoreListSelect}
						>
						</d2l-menu-item>
						<d2l-menu-item
							schedule-id="${ scheduleId }"
							text="${this.localize('contextMenu:applyNow')}"
							@d2l-menu-item-select=${this._handleWarningDialogOpen}
						>
						</d2l-menu-item>
						<d2l-menu-item
							schedule-id="${ scheduleId }"
							text="${this.localize('contextMenu:delete')}"
							@d2l-menu-item-select=${this._handleDeleteWarningDialogOpen}
						>
						</d2l-menu-item>
					</d2l-menu>
				</d2l-dropdown-menu>
			</d2l-dropdown-context-menu>
		`;
	}

	_renderDeleteWarningDialog() {
		return html`
			<d2l-dialog
		        title-text="${this.localize('warningDialog:title')}"
				?opened=${this.openDeleteDialog}
				@d2l-dialog-close=${this._handleDeleteWarningDialogClose}
			>
				<div>
					<p>${this.localize('deleteDialog:content')}<p>
				</div>
				<d2l-button slot="footer" primary @click=${this._handleDelete}>
					${this.localize('button:delete')}
				</d2l-button>
				<d2l-button slot="footer" data-dialog-action>
					${this.localize('button:cancel')}
				</d2l-button>
			</d2l-dialog>
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
				<td>${schedule.courseOfferingSubjectCodeFilter.join(', ')}</td>
				<td>${schedule.courseOfferingSessionCodeFilter}</td>
				<td>${lastDateApplied}</td>
			</tr>
		`;
	}

	_renderTable() {
		return html`
			<d2l-table-wrapper sticky-headers>
				<table class="d2l-table">
					<thead>
						<th>${this.localize('tableHeader:scheduleName')}</th>
						<th>${this.localize('tableHeader:semester')}</th>
						<th>${this.localize('tableHeader:subject')}</th>
						<th>${this.localize('tableHeader:session')}</th>
						<th>${this.localize('tableHeader:lastDateApplied')}</th>
					</thead>
					<tbody>
						${ this.isQuerying ? '' : this.allSchedules.map(schedule => this._renderSchedule(schedule)) }
					</tbody>
				</table>

			${this._renderWarningDialog()}
			${this._renderDeleteWarningDialog()}
		`;
	}

	_renderWarningDialog() {
		return html`
			<d2l-dialog
		        title-text="${this.localize('warningDialog:title')}"
				?opened=${this.openApplyNowDialog}
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

