import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
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
			},
			openDialog: {
				type: Boolean
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
		this.openDialog = false;
	}

	async connectedCallback() {
		super.connectedCallback();

		this.isLoading = true;
		await this._queryAllSchedules();
		this.isLoading = false;
	}

	render() {
		return html`
			<h2>${ this.localize('page:title') }</h2>
			<p>${ this.localize('page:description') }</p>
			${ this.isLoading ? this._renderSpinner() : this._renderTable() }
		`;
	}

	async _queryAllSchedules() {
		this.isQuerying = true;
		this.allSchedules = await this.scheduleService.getAllSchedules();
		this.isQuerying = false;
	}

	_handleWarningDialogOpen() {
		this.openDialog = true;
	}

	_renderContextMenu() {
		return html`
			<d2l-dropdown-context-menu>
				<d2l-dropdown-menu label=${this.localize('contextMenu:label')}>
					<d2l-menu label="${this.localize('contextMenu:label')}">
						<d2l-menu-item text="${this.localize('contextMenu:edit')}"></d2l-menu-item>
						<d2l-menu-item text="${this.localize('contextMenu:viewIgnoreList')}"></d2l-menu-item>
						<d2l-menu-item
							text="${this.localize('contextMenu:applyNow')}"
							@d2l-menu-item-select=${this._handleWarningDialogOpen}
						>
						</d2l-menu-item>
					</d2l-menu>
				</d2l-dropdown-menu>
			</d2l-dropdown-context-menu>
			${this._renderWarningDialog()}
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
		`;
	}

	_renderWarningDialog() {
		return html`
			<d2l-dialog
				?opened=${this.openDialog}
				@d2l-dialog-close=${this._handleWarningDialogClose}
			>
                <div>
					${this.localize('warningDialog:content', {courseCount: 10})}
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

	_handleWarningDialogClose() {
		this.dispatchEvent(new CustomEvent('close'));
	}

	_handleApplyNow() {
		console.log("Apply Now");
	}
}
customElements.define('module-scheduler-manager', ModuleSchedulerManager);

