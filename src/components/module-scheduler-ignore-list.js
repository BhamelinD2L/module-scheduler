import '@brightspace-ui-labs/pagination/pagination.js';
import { css, html, LitElement } from 'lit-element/lit-element';
import { BaseMixin } from '../mixins/base-mixin.js';
import completionStatusIdConverter from '../helpers/completion-status-codes.js';
import { getDateFromISODateTime } from '@brightspace-ui/core/helpers/dateTime.js';
import { heading1Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeMixin } from '../mixins/localize-mixin.js';
import { renderSpinner } from '../helpers/spinner.js';
import { ScheduleServiceFactory } from '../services/schedule-service-factory.js';
import { tableStyles } from '@brightspace-ui/core/components/table/table-wrapper.js';

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
			`
		];
	}

	constructor() {
		super();

		this.scheduleService = ScheduleServiceFactory.getScheduleService();

		this.scheduleId = null,
		this.scheduleName = null;
		this.ignoreListItems = [];
		this._totalIgnoreListItems = null;
		this._pageSize = 20;
		this._pageNumber = 1;

		// Start the app in loading state
		this._isFetchingIgnoreList = true;
		this._isFetchingSchedule = true;
	}

	get isLoading() {
		return this._isFetchingIgnoreList || this._isFetchingSchedule;
	}

	async connectedCallback() {
		super.connectedCallback();

		if (this.scheduleName === '') {
			await this._fetchSchedule();
		}
	}

	updated(changedProperties) {
		if (changedProperties.has('_pageSize') || changedProperties.has('_pageNumber')) {
			this._fetchIgnoreList();
		}
	}

	render() {
		if (this.isLoading) {
			return renderSpinner();
		}

		return html`
			<h2>${this.localize('ignoreList:title', { scheduleName: this.scheduleName })}</h2>
			<p>${this.localize('page:description')}</p>
			${ this._renderTable() }
		`;
	}

	async _fetchIgnoreList() {
		this._isFetchingIgnoreList = true;
		[
			this.ignoreListItems,
			this._totalIgnoreListItems
		] = await Promise.all([
			this.scheduleService.getIgnoreList(this.scheduleId, this._pageSize, this._pageNumber),
			this.scheduleService.getIgnoreListCount(this.scheduleId)
		]);
		this._isFetchingIgnoreList = false;
	}

	async _fetchSchedule() {
		this._isFetchingSchedule = true;
		try {
			const schedule = await this.scheduleService.getSchedule(this.scheduleId);
			this.scheduleName = schedule.scheduleName;
		} catch (e) {
			this.redirectTo404();
		}
		this._isFetchingSchedule = false;
	}

	_handleItemsPerPageChange(e) {
		this._pageSize = e.detail.itemCount;
		this._pageNumber = 1;
	}

	_handlePageChange(e) {
		this._pageNumber = e.detail.page;
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
		const maxPageNumber = Math.floor((this._totalIgnoreListItems - 1) / this._pageSize) + 1;

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
					${ this.ignoreListItems.map(item => this._renderIgnoreListItem(item)) }
				</tbody>
			</table>
		</d2l-table-wrapper>
		${this._renderPagination()}
		`;
	}

}
customElements.define('module-scheduler-ignore-list', ModuleSchedulerIgnoreList);
