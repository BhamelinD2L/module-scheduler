import '@brightspace-ui/core/components/alert/alert.js';
import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import '@brightspace-ui/core/components/inputs/input-search.js';
import '@brightspace-ui-labs/pagination/pagination.js';
import { css, html, LitElement } from 'lit-element/lit-element';
import { AppRoutes } from '../helpers/app-routes.js';
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
			scheduleId: {
				type: String
			},
			scheduleName: {
				type: String
			},
			ignoreListItems: {
				type: Array
			},
			_showAddToIgnoreListAlert: {
				type: Boolean
			},
			_showAddToIgnoreListDialog: {
				type: Boolean
			},
			_addToScheduleCourseOfferingId: {
				type: String
			},
			_totalIgnoreListItems: {
				type: Number,
				attribute: false
			},
			_pageSize: {
				type: Number,
				attribute: false
			},
			_pageNumber: {
				type: Number,
				attribute: false
			},
			_isFetchingIgnoreList: {
				type: Boolean,
				attribute: false
			},
			_isFetchingSchedule: {
				type: Boolean,
				attribute: false
			},
			_searchText: {
				type: String,
				attribute: false
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
					flex: 0;
					margin-bottom: 10px;
				}

				.d2l-add-to-ignore-list-btn > d2l-icon {
					color: inherit;
					margin-right: 5px;
				}

				.d2l-dialog-footer {
					display: flex;
					height: 70px;
				}

				.d2l-add-to-ignore-list-dialog-btn {
					margin: auto 20px auto 0;
				}

				.d2l-tools-wrapper {
					display: flex;
					margin-bottom: 15px;
				}

				.d2l-buttons-wrapper {
					display: flex;
					flex: 0.5 1 0;
				}

				.d2l-search-wrapper {
					display: flex;
					flex: 0.5 1 0;
					justify-content: flex-end;
				}

				.d2l-search {
					flex: 0.8 1 0;
				}

				.d2l-ignore-list-title {
					margin-top: 10px;
				}
			`
		];
	}

	constructor() {
		super();

		this.scheduleService = ScheduleServiceFactory.getScheduleService();

		this.scheduleId = null,
		this.scheduleName = null;
		this.ignoreListItems = [];
		this._showAddToIgnoreListAlert = false;
		this._showAddToIgnoreListDialog = false;
		this._addToScheduleCourseOfferingId = '';
		this._totalIgnoreListItems = null;
		this._pageSize = 20;
		this._pageNumber = 1;
		this._searchText = '';
		this._isFetchingIgnoreList = false;
		this._isFetchingSchedule = false;
	}

	async connectedCallback() {
		super.connectedCallback();

		await this._fetchSchedule();
		await this._fetchIgnoreList();
	}

	render() {
		if (this._isFetchingSchedule) {
			return renderSpinner();
		}

		return html`
			${ this._renderAddToIgnoreListDialog() }
			<d2l-button-subtle
				@click="${this._handleBackToHome}"
				icon="tier3:chevron-left"
				text=${ this.localize('button:back') }>
			</d2l-button-subtle>
			<h2 class="d2l-ignore-list-title">${this.localize('ignoreList:title', { scheduleName: this.scheduleName })}</h2>
			<p>${this.localize('page:description')}</p>
			<div class="d2l-tools-wrapper">
				${this._renderButtons()}
				${this._renderSearch()}
			
			</div>
			${this._isFetchingIgnoreList ? renderSpinner() : this._renderTable()}
		`;
	}

	updated(changedProperties) {
		if (
			changedProperties.has('_pageSize') ||
			changedProperties.has('_pageNumber') ||
			changedProperties.has('_searchText')
		) {
			this._fetchIgnoreList();
		}
	}

	async _add() {
		// TODO: Validate org unit ID?
		try {
			await this.scheduleService.addToIgnoreList(this.scheduleId, this._addToScheduleCourseOfferingId);
			this._addToScheduleCourseOfferingId = '';
			this._handleAddToIgnoreListDialogClose();
		} catch (err) {
			this._showAddToIgnoreListAlert = true;
			// TODO: handle errors
		} finally {
			await this._fetchIgnoreList();
		}
	}

	async _fetchIgnoreList() {
		this._isFetchingIgnoreList = true;
		[
			this.ignoreListItems,
			this._totalIgnoreListItems
		] = await Promise.all([
			this.scheduleService.getIgnoreList(this.scheduleId, this._searchText, this._pageSize, this._pageNumber),
			this.scheduleService.getIgnoreListCount(this.scheduleId, this._searchText)
		]);
		this._isFetchingIgnoreList = false;
	}

	async _fetchSchedule() {
		this._isFetchingSchedule = true;
		try {
			const schedule = await this.scheduleService.getSchedule(this.scheduleId);
			this.scheduleName = schedule.scheduleName;
		} catch (e) {
			this.redirectToNotFound();
		}
		this._isFetchingSchedule = false;
	}

	async _handleAddToIgnoreListDialogClose() {
		this._showAddToIgnoreListDialog = false;
	}

	_handleBackToHome() {
		this.navigateTo(AppRoutes.Home());
	}

	_handleCourseOfferingIdInput(e) {
		this._addToScheduleCourseOfferingId = e.target.value;
		this._showAddToIgnoreListAlert = false;
	}

	_handleItemsPerPageChange(e) {
		this._pageSize = e.detail.itemCount;
		this._pageNumber = 1;
	}

	_handlePageChange(e) {
		this._pageNumber = e.detail.page;
	}

	_handleSearch(e) {
		this._searchText = e.detail.value;
		this._pageNumber = 1;
	}

	async _openAddToIgnoreListDialog() {
		this._showAddToIgnoreListDialog = true;
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
				?opened="${this._showAddToIgnoreListDialog}"
				>
				<div class="d2l-add-to-ignore-list-dialog-content">
					<label for="addToIgnoreListCourseOfferingId">
						${this.localize('ignoreList:addToIgnoreListCourseOfferingId')}
					</label>
					<d2l-input-text
						autocomplete="off"
						id="addToIgnoreListCourseOfferingId"
						value="${this._addToScheduleCourseOfferingId || ''}"
						@input=${this._handleCourseOfferingIdInput}
						label=${this.localize('ignoreList:addToIgnoreListCourseOfferingId')}
						label-hidden
						>
					</d2l-input-text>
				</div>
				<div slot="footer" class="d2l-dialog-footer">
					<d2l-button
						class="d2l-add-to-ignore-list-dialog-btn"
						?disabled="${!this._addToScheduleCourseOfferingId}"
						@click="${this._add}"
						primary>
						${this.localize('ignoreList:addToIgnoreListDialogBtn')}
					</d2l-button>
					<d2l-alert
						type="warning"
						?hidden="${!this._showAddToIgnoreListAlert}">
						${this.localize('ignoreList:addToIgnoreListDialogAlert')}
					</d2l-alert>
				</div>
			</d2l-dialog>
		`;
	}

	_renderButtons() {
		return html`
			<div class="d2l-buttons-wrapper">
				<d2l-button
					primary
					class="d2l-add-to-ignore-list-btn"
					@click="${this._openAddToIgnoreListDialog}">
					<d2l-icon icon="tier1:plus-large-thick"></d2l-icon>
					${ this.localize('ignoreList:addToIgnoreListButton') }
				</d2l-button>
			</div>
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

	_renderPagination() {
		const maxPageNumber = Math.max(
			Math.floor((this._totalIgnoreListItems - 1) / this._pageSize) + 1,
			1
		);

		return html`
			<d2l-labs-pagination
				page-number="${this._pageNumber}"
				max-page-number="${maxPageNumber}"
				show-item-count-select
				item-count-options="[20,50,100,200]"
				selected-count-option="${this._pageSize}"
				@pagination-page-change=${this._handlePageChange}
				@pagination-item-counter-change=${this._handleItemsPerPageChange}
			></d2l-labs-pagination>
		`;
	}

	_renderSearch() {
		return html`
			<div class="d2l-search-wrapper">
				<d2l-input-search
					class="d2l-search"
					label="Search"
					placeholder="Search"
					@d2l-input-search-searched=${this._handleSearch}
				></d2l-input-search>
			</div>
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
					${ this._isFetchingIgnoreList ? renderSpinner() : this._renderTableItems() }
				</tbody>
			</table>
		</d2l-table-wrapper>
		${this._renderPagination()}
		`;
	}

	_renderTableItems() {
		return html`
			${ this.ignoreListItems.map(item => this._renderIgnoreListItem(item)) }
		`;
	}

}
customElements.define('module-scheduler-ignore-list', ModuleSchedulerIgnoreList);
