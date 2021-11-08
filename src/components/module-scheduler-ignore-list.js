import '@brightspace-ui/core/components/alert/alert.js';
import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import { css, html, LitElement } from 'lit-element/lit-element';
import { BaseMixin } from '../mixins/base-mixin.js';
import completionStatusIdConverter from '../helpers/completion-status-codes.js';
import { getDateFromISODateTime } from '@brightspace-ui/core/helpers/dateTime.js';
import { heading1Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeMixin } from '../mixins/localize-mixin.js';
import { renderSpinner } from '../helpers/spinner.js';
import { ScheduleServiceFactory } from '../services/schedule-service-factory.js';
import { tableStyles } from '@brightspace-ui/core/components/table/table-wrapper.js';

const ADD_TO_IGNORE_LIST_DIALOG_ID = 'd2l-add-to-ignore-list-dialog';

class ModuleSchedulerIgnoreList extends BaseMixin(LocalizeMixin(LitElement)) {
	static get properties() {
		return {
			addToScheduleCourseOfferingId: {
				type: String
			},
			isLoadingSchedule: {
				type: Boolean
			},
			isLoadingIgnoreList: {
				type: Boolean
			},
			scheduleId: {
				type: String
			},
			scheduleName: {
				type: String
			},
			showAddToIgnoreListDialog: {
				type: Boolean
			},
			ignoreListItems: {
				type: Array
			},
			showAddToIgnoreListAlert: {
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
					left: 50%;
					margin-right: -50%;
					margin-top: 48px;
					position: absolute;
					transform: translateX(-50%);
				}

				.d2l-add-to-ignore-list-btn {
					margin-bottom: 5px;
				}

				.d2l-dialog-footer {
					display: flex;
					height: 70px;
				}

				.d2l-add-to-ignore-list-dialog-btn {
					margin: auto 20px auto 0;
				}
			`
		];
	}

	constructor() {
		super();

		this.scheduleService = ScheduleServiceFactory.getScheduleService();

		this.addToScheduleCourseOfferingId = '';
		this.isLoadingSchedule = true;
		this.isLoadingIgnoreList = false;
		this.scheduleId = null,
		this.scheduleName = null;
		this.showAddToIgnoreListDialog = false;
		this.ignoreListItems = [];
		this.showAddToIgnoreListAlert = false;

	}

	async connectedCallback() {
		super.connectedCallback();

		await this._fetchSchedule();
		await this._fetchIgnoreList();
	}

	render() {
		if (this.isLoadingSchedule) {
			return renderSpinner();
		}

		return html`
			${ this._renderAddToIgnoreListDialog() }
			<h2>${this.localize('ignoreList:title', { scheduleName: this.scheduleName })}</h2>
			<p>${this.localize('page:description')}</p>
			<d2l-button-subtle
				class="d2l-add-to-ignore-list-btn"
				@click="${this._openAddToIgnoreListDialog}"
				text=${ this.localize('ignoreList:addToIgnoreListButton') }>
			</d2l-button-subtle>
			${ this._renderTable() }
		`;
	}

	async _add() {
		// TODO: Validate org unit ID?
		try {
			await this.scheduleService.addToIgnoreList(this.scheduleId, this.addToScheduleCourseOfferingId);
			this.addToScheduleCourseOfferingId = '';
			this._handleAddToIgnoreListDialogClose();
		} catch (err) {
			this.showAddToIgnoreListAlert = true;
			// TODO: handle errors
		} finally {
			await this._fetchIgnoreList();
		}
	}

	async _fetchIgnoreList() {
		this.isLoadingIgnoreList = true;
		this.ignoreListItems = await this.scheduleService.getIgnoreList(this.scheduleId);
		this.isLoadingIgnoreList = false;
	}

	async _fetchSchedule() {
		this.isLoadingSchedule = true;
		const schedule = await this.scheduleService.getSchedule(this.scheduleId);
		this.scheduleName = schedule.scheduleName;
		this.isLoadingSchedule = false;
	}

	async _handleAddToIgnoreListDialogClose() {
		this.showAddToIgnoreListDialog = false;
	}

	_handleCourseOfferingIdInput(e) {
		this.addToScheduleCourseOfferingId = e.target.value;
		this.showAddToIgnoreListAlert = false;
	}

	async _openAddToIgnoreListDialog() {
		this.showAddToIgnoreListDialog = true;
		await new Promise((r) => setTimeout(r, 0));
		this.shadowRoot.getElementById('addToIgnoreListCourseOfferingId').focus();
	}

	_renderAddToIgnoreListDialog() {
		return html`
			<d2l-dialog
				class="d2l-add-to-ignore-list-dialog"
				title-text="${this.localize('ignoreList:addToIgnoreListDialogTitle')}"
				@d2l-dialog-close="${this._handleAddToIgnoreListDialogClose}"
				id="${ADD_TO_IGNORE_LIST_DIALOG_ID}"
				?opened="${this.showAddToIgnoreListDialog}"
				>
				<div class="d2l-add-to-ignore-list-dialog-content">
					<label for="addToIgnoreListCourseOfferingId">
						${this.localize('ignoreList:addToIgnoreListCourseOfferingId')}
					</label>
					<d2l-input-text
						autocomplete="off"
						id="addToIgnoreListCourseOfferingId"
						value="${this.addToScheduleCourseOfferingId || ''}"
						@input=${this._handleCourseOfferingIdInput}
						label=${this.localize('ignoreList:addToIgnoreListCourseOfferingId')}
						label-hidden
						>
					</d2l-input-text>
				</div>
				<div slot="footer" class="d2l-dialog-footer">
					<d2l-button
						class="d2l-add-to-ignore-list-dialog-btn"
						?disabled="${!this.addToScheduleCourseOfferingId}"
						@click="${this._add}"
						primary>
						${this.localize('ignoreList:addToIgnoreListDialogBtn')}
					</d2l-button>
					<d2l-alert
						type="warning"
						?hidden="${!this.showAddToIgnoreListAlert}">
						${this.localize('ignoreList:addToIgnoreListDialogAlert')}
					</d2l-alert>
				</div>
			</d2l-dialog>
		`;
	}

	_renderIgnoreListItem(item) {
		return html`
		<tr>
			<td>${item.courseOfferingName}</td>
			<td>${item.courseOfferingCode}</td>
			<td>${item.lastDateApplied ? getDateFromISODateTime(item.lastDateApplied).toLocaleString() : ''}</td>
			<td>${item.lastCompletionStatusId ? completionStatusIdConverter.convertIdToText(item.lastCompletionStatusId) : ''}</td>
		</tr>
	`;
	}

	_renderTable() {
		return html`
		<d2l-table-wrapper sticky-headers>
			<table class="d2l-table">
				<thead>
					<th>${this.localize('ignoreList:courseOfferingName')}</th>
					<th>${this.localize('ignoreList:courseOfferingCode')}</th>
					<th>${this.localize('tableHeader:lastDateApplied')}</th>
					<th>${this.localize('ignoreList:completionStatus')}</th>
				</thead>
				<tbody>
					${ this.isLoadingIgnoreList ? renderSpinner() : this._renderTableItems() }
				</tbody>
			</table>
		</d2l-table-wrapper>
		`;
	}

	_renderTableItems() {
		return html`
			${ this.ignoreListItems.map(item => this._renderIgnoreListItem(item)) }
		`;
	}

}
customElements.define('module-scheduler-ignore-list', ModuleSchedulerIgnoreList);
