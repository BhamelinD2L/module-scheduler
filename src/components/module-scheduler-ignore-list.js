import { css, html, LitElement } from 'lit-element/lit-element';
import { BaseMixin } from '../mixins/base-mixin.js';
import completionStatusIdConverter from '../helpers/completion-status-codes.js';
import { heading1Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeMixin } from '../mixins/localize-mixin.js';
import { ScheduleServiceFactory } from '../services/schedule-service-factory.js';
import { tableStyles } from '@brightspace-ui/core/components/table/table-wrapper.js';

class ModuleSchedulerIgnoreList extends BaseMixin(LocalizeMixin(LitElement)) {
	static get properties() {
		return {
			isLoading: {
				type: Boolean
			},
			scheduleId: {
				type: String
			},
			scheduleName: {
				type: String
			},
			ignoreListItems: {
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
		this.scheduleId = null,
		this.scheduleName = null;
		this.ignoreListItems = [];

	}

	async connectedCallback() {
		super.connectedCallback();

		this.isLoading = true;

		await this._fetchIgnoreList();
		this.isLoading = false;
	}

	render() {
		return html`
			<h2>${this.localize('ignoreList:title', { scheduleName: this.scheduleName })}</h2>
			<p>${this.localize('page:description')}</p>
			${this._renderTable()}
		`;
	}

	async _fetchIgnoreList() {
		this.ignoreListItems = await this.scheduleService.getIgnoreList(this.scheduleId);
	}

	_renderIgnoreListItem(item) {
		return html`
		<tr>
			<td>${item.courseOfferingName}</td>
			<td>${item.courseOfferingCode}</td>
			<td>${item.lastDateApplied}</td>
			<td>${completionStatusIdConverter.convertIdText(item.lastCompletionStatusId)}</td>
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
					${ this.ignoreListItems.map(item => this._renderIgnoreListItem(item)) }
				</tbody>
			</table>
		</d2l-table-wrapper>
		`;
	}

}
customElements.define('module-scheduler-ignore-list', ModuleSchedulerIgnoreList);
