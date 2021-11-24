import '@brightspace-ui/core/components/alert/alert.js';
import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import '@brightspace-ui/core/components/dialog/dialog-confirm.js';
import '@brightspace-ui/core/components/inputs/input-search.js';
import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import '@brightspace-ui/core/components/table/table-col-sort-button';
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
import { SortableColumn } from '../constants.js';
import { tableStyles } from '@brightspace-ui/core/components/table/table-wrapper.js';

const ADD_TO_IGNORE_LIST_DIALOG_ID = 'd2l-add-to-ignore-list-dialog';

function toggleSetItem(srcSet, item) {
	const newSet = new Set(srcSet);

	if (newSet.has(item)) {
		newSet.delete(item);
	} else {
		newSet.add(item);
	}

	return newSet;
}

function addSetItems(srcSet, items = []) {
	const newSet = new Set(srcSet);

	items.forEach((item) => newSet.add(item));

	return newSet;
}

function deleteSetItems(srcSet, items = []) {
	const newSet = new Set(srcSet);

	items.forEach((item) => newSet.delete(item));

	return newSet;
}

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
			},
			_selectedItems: {
				type: Set,
				attribute: false
			},
			_removeSelectedConfirmDialogOpened: {
				type: Boolean,
				attribute: false
			},
			_removeAllConfirmDialogOpened: {
				type: Boolean,
				attribute: false
			},
			_isDeletingItems: {
				type: Boolean,
				attribute: false
			},
			_sortField: {
				type: Number,
				attribute: false
			},
			_sortIsDesc: {
				type: Boolean,
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

				.d2l-checkbox-cell {
					text-align: center !important;
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

				.d2l-action-bar {
					display: flex;
					justify-content: space-between;
					margin-bottom: 15px;
				}

				.d2l-action-buttons {
					flex: 3 1 0;
				}

				.d2l-search {
					flex: 1 1 0;
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
		this._selectedItems = new Set();
		this._removeSelectedConfirmDialogOpened = false;
		this._removeAllConfirmDialogOpened = false;
		this._sortField = SortableColumn.CourseOfferingName;
		this._sortIsDesc = false;
	}

	async connectedCallback() {
		super.connectedCallback();

		if (this.scheduleName === '') {
			await this._fetchSchedule();
		}
		await this._fetchIgnoreList();
	}

	render() {
		if (this._isFetchingSchedule) {
			return renderSpinner();
		}

		return html`
			${ this._renderAddToIgnoreListDialog() }
			${this._renderRemoveAllConfirmDialog()}
			${this._renderRemoveSelectedConfirmDialog()}
			<d2l-button-subtle
				@click="${this._handleBackToHome}"
				icon="tier3:chevron-left"
				text=${ this.localize('button:back') }>
			</d2l-button-subtle>
			<h2 class="d2l-ignore-list-title">
				${this.localize('ignoreList:title', { scheduleName: this.scheduleName })}
			</h2>
			<p>${this.localize('page:description')}</p>
			<div class="d2l-action-bar">
				${this._renderActionButtons()}
				${this._renderSearch()}
			</div>
			${this._isTableLoading ? renderSpinner() : this._renderTable()}
		`;
	}

	updated(changedProperties) {
		if (
			changedProperties.has('_pageSize') ||
			changedProperties.has('_pageNumber') ||
			changedProperties.has('_searchText') ||
			changedProperties.has('_sortField') ||
			changedProperties.has('_sortIsDesc')
		) {
			this._fetchIgnoreList();
		}
	}

	get _isTableLoading() {
		return this._isFetchingIgnoreList || this._isDeletingItems;
	}

	get _pageItemsSelected() {
		return this.ignoreListItems.every((item) => this._selectedItems.has(item.courseOfferingId));
	}

	async _add() {
		try {
			await this.scheduleService.addToIgnoreList(this.scheduleId, this._addToScheduleCourseOfferingId);
			this._addToScheduleCourseOfferingId = '';
			this._handleAddToIgnoreListDialogClose();
		} catch (err) {
			this._showAddToIgnoreListAlert = true;
		} finally {
			await this._fetchIgnoreList();
		}
	}

	_clearSelectedItems() {
		this._selectedItems = new Set();
	}

	async _fetchIgnoreList() {
		this._isFetchingIgnoreList = true;
		[
			this.ignoreListItems,
			this._totalIgnoreListItems
		] = await Promise.all([
			this.scheduleService.getIgnoreList(
				this.scheduleId,
				this._searchText,
				this._pageSize,
				this._pageNumber,
				this._sortField,
				!this._sortIsDesc
			),
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

	_genItemSelectHandler(item) {
		return () => {
			this._selectedItems = toggleSetItem(this._selectedItems, item);
		};
	}

	async _handleAddToIgnoreListDialogClose() {
		this._showAddToIgnoreListDialog = false;
	}

	_handleBackToHome() {
		this.navigateTo(AppRoutes.Home());
	}

	async _handleCloseRemoveAllConfirmDialog(e) {
		this._removeAllConfirmDialogOpened = false;

		if (e.detail.action !== 'yes') return;

		this._clearSelectedItems();

		this._isDeletingItems = true;
		await this.scheduleService.deleteIgnoreListItems(this.scheduleId);
		this._isDeletingItems = false;

		if (this._pageNumber !== 1) {
			this._pageNumber = 1;
		} else {
			this._fetchIgnoreList();
		}
	}

	async _handleCloseRemoveSelectedConfirmDialog(e) {
		this._removeSelectedConfirmDialogOpened = false;

		if (e.detail.action !== 'yes') return;

		const itemsToDelete = Array.from(this._selectedItems);
		this._clearSelectedItems();

		this._isDeletingItems = true;
		await this.scheduleService.deleteIgnoreListItems(this.scheduleId, itemsToDelete);
		this._isDeletingItems = false;

		if (this._pageNumber !== 1) {
			this._pageNumber = 1;
		} else {
			this._fetchIgnoreList();
		}
	}

	_handleCourseOfferingIdInput(e) {
		this._addToScheduleCourseOfferingId = e.target.value;
		this._showAddToIgnoreListAlert = false;
	}

	_handleItemsPerPageChange(e) {
		this._pageSize = e.detail.itemCount;
		this._pageNumber = 1;
	}

	_handleOpenRemoveAllConfirmDialog() {
		this._removeAllConfirmDialogOpened = true;
	}

	_handleOpenRemoveSelectedConfirmDialog() {
		this._removeSelectedConfirmDialogOpened = true;
	}

	_handlePageChange(e) {
		this._pageNumber = e.detail.page;
	}

	_handlePageSelect() {
		const pageItemIds = this.ignoreListItems.map(({ courseOfferingId }) => courseOfferingId);

		if (this._pageItemsSelected) {
			this._selectedItems = deleteSetItems(this._selectedItems, pageItemIds);
		} else {
			this._selectedItems = addSetItems(this._selectedItems, pageItemIds);
		}
	}

	_handleSearch(e) {
		this._searchText = e.detail.value.trim();
		this._pageNumber = 1;
		this._clearSelectedItems();
	}

	_handleSort(e) {
		const field = parseInt(e.target.id);

		if (this._sortField === field) {
			this._sortIsDesc = !this._sortIsDesc;
		} else {
			this._sortIsDesc = false;
			this._sortField = field;
		}
	}

	async _openAddToIgnoreListDialog() {
		this._showAddToIgnoreListDialog = true;
		await new Promise((r) => setTimeout(r, 0));
		this.shadowRoot.getElementById('addToIgnoreListCourseOfferingId').focus();
	}

	_renderActionButtons() {
		return html`
			<div class="d2l-action-buttons">
				<d2l-button
					primary
					class="d2l-add-to-ignore-list-btn"
					@click="${this._openAddToIgnoreListDialog}">
					<d2l-icon icon="tier1:plus-large-thick"></d2l-icon>
					${ this.localize('ignoreList:addToIgnoreListButton') }
				</d2l-button>
				<d2l-button-subtle
					text=${this.localize('ignoreList:removeSelectedItems', { selectedCount: this._selectedItems.size })}
					icon="tier1:delete"
					?disabled=${this._isTableLoading || !this._selectedItems.size}
					@click=${this._handleOpenRemoveSelectedConfirmDialog}
				></d2l-button-subtle>
				<d2l-button-subtle
					text=${this.localize('ignoreList:removeAllItems')}
					icon="tier1:delete"
					?disabled=${this._isTableLoading || !this.ignoreListItems.length}
					@click=${this._handleOpenRemoveAllConfirmDialog}
				></d2l-button-subtle>
			</div>
		`;
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

	_renderIgnoreListItem(item) {
		return html`
		<tr>
			<td class="d2l-checkbox-cell">
				<d2l-input-checkbox
					aria-label="${this.localize('ignoreList:selectItemLabel', { courseOfferingName: item.courseOfferingName })}"
					?checked=${this._selectedItems.has(item.courseOfferingId)}
					@change=${this._genItemSelectHandler(item.courseOfferingId)}
				></d2l-input-checkbox>
			</td>
			<td>${item.courseOfferingName}</td>
			<td>${item.courseOfferingCode}</td>
			<td>
				${item.lastDateApplied ? getDateFromISODateTime(item.lastDateApplied).toLocaleString() : ''}
			</td>
			<td>
				${item.lastCompletionStatusId ? completionStatusIdConverter.convertIdToText(item.lastCompletionStatusId) : ''}
			</td>
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

	_renderRemoveAllConfirmDialog() {
		return html`
			<d2l-dialog-confirm
				title-text="${this.localize('ignoreList:removeAllConfirmDialog:title')}"
				text="${this.localize('ignoreList:removeAllConfirmDialog:message', { selectedCount: this._selectedItems.size })}"
				?opened=${this._removeAllConfirmDialogOpened}
				@d2l-dialog-close=${this._handleCloseRemoveAllConfirmDialog}
			>
				<d2l-button slot="footer" primary data-dialog-action="yes">
					${this.localize('ignoreList:removeAllConfirmDialog:confirmButton')}
				</d2l-button>
				<d2l-button slot="footer" data-dialog-action>
					${this.localize('ignoreList:removeAllConfirmDialog:cancelButton')}
				</d2l-button>
			</d2l-dialog-confirm>
		`;
	}

	_renderRemoveSelectedConfirmDialog() {
		return html`
			<d2l-dialog-confirm
				title-text="${this.localize('ignoreList:removeSelectedConfirmDialog:title')}"
				text="${this.localize('ignoreList:removeSelectedConfirmDialog:message', { selectedCount: this._selectedItems.size })}"
				?opened=${this._removeSelectedConfirmDialogOpened}
				@d2l-dialog-close=${this._handleCloseRemoveSelectedConfirmDialog}
			>
				<d2l-button slot="footer" primary data-dialog-action="yes">
					${this.localize('ignoreList:removeSelectedConfirmDialog:confirmButton')}
				</d2l-button>
				<d2l-button slot="footer" data-dialog-action>
					${this.localize('ignoreList:removeSelectedConfirmDialog:cancelButton')}
				</d2l-button>
			</d2l-dialog-confirm>
		`;
	}

	_renderSearch() {
		return html`
			<d2l-input-search
				class="d2l-search"
				label="Search"
				placeholder="Search"
				@d2l-input-search-searched=${this._handleSearch}
			></d2l-input-search>
		`;
	}

	_renderTable() {
		return html`
		<d2l-table-wrapper sticky-headers>
			<table class="d2l-table">
				<thead>
					<th class="d2l-checkbox-cell">
						<d2l-input-checkbox
							aria-label="${this.localize('ignoreList:selectPageLabel')}"
							?checked=${this._pageItemsSelected}
							@change=${this._handlePageSelect}
						></d2l-input-checkbox>
					</th>
					<th>
						<d2l-table-col-sort-button
							id=${SortableColumn.CourseOfferingName}
							@click=${this._handleSort}
							?nosort=${this._sortField !== SortableColumn.CourseOfferingName}
							?desc=${this._sortIsDesc}>
						${this.localize('ignoreList:courseOfferingName')}
						</d2l-table-col-sort-button>
					</th>
					<th>
						<d2l-table-col-sort-button
							id=${SortableColumn.CourseOfferingCode}
							@click=${this._handleSort}
							?nosort=${this._sortField !== SortableColumn.CourseOfferingCode}
							?desc=${this._sortIsDesc}>
						${this.localize('ignoreList:courseOfferingCode')}
						</d2l-table-col-sort-button>
					</th>
					<th>
						<d2l-table-col-sort-button
							id=${SortableColumn.LastDateApplied}
							@click=${this._handleSort}
							?nosort=${this._sortField !== SortableColumn.LastDateApplied}
							?desc=${this._sortIsDesc}>
						${this.localize('tableHeader:lastDateApplied')}
						</d2l-table-col-sort-button>
					</th>
					<th>
						<d2l-table-col-sort-button
							id=${SortableColumn.CompletionStatusName}
							@click=${this._handleSort}
							?nosort=${this._sortField !== SortableColumn.CompletionStatusName}
							?desc=${this._sortIsDesc}>
						${this.localize('ignoreList:completionStatus')}
						</d2l-table-col-sort-button>
					</th>
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
