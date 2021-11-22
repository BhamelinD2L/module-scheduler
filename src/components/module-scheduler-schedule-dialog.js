import '@brightspace-ui/core/components/alert/alert.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import '@brightspace-ui/core/components/inputs/input-text';
import '@brightspace-ui/core/components/inputs/input-textarea';
import '@brightspace-ui-labs/multi-select/multi-select-list.js';
import '@brightspace-ui-labs/multi-select/multi-select-list-item.js';
import { CANCEL_ACTION, SAVE_ACTION } from '../constants.js';
import { css, html, LitElement } from 'lit-element/lit-element';
import { labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeMixin } from '../mixins/localize-mixin.js';
import { ScheduleServiceFactory } from '../services/schedule-service-factory.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles';

const DIALOG_ID = 'd2l-schedule-dialog';
const JSON_PLACEHOLDER = '[\n\t{\n\t\t\'StartDate\': \'MM/DD/YYYY\',\n\t\t\'DueDate\': \'MM/DD/YYYY\',\n\t\t\'EndDate\': \'MM/DD/YYYY\'\n\t}\n]';

class ScheduleDialog extends LocalizeMixin(LitElement) {
	static get properties() {
		return {
			scheduleId: {
				type: String
			},
			scheduleName: {
				type: String
			},
			scheduleJson: {
				type: Object
			},
			semesterId: {
				type: String
			},
			sessionCode: {
				type: String
			},
			subjectCode: {
				type: String
			},
			moduleIgnoreList: {
				type: Array
			},
			semesters: {
				type: Array
			},
			openDialog: {
				type: Boolean
			},
			_readyToShowDialog: {
				type: Boolean
			},
			_missingSubjectOrSessionField: {
				type: Boolean
			},
			_missingSemester: {
				type: Boolean
			},
			_invalidSubjectField: {
				type: Boolean
			},
			_invalidJsonField: {
				type: Boolean
			}
		};
	}

	static get styles() {
		return [
			labelStyles,
			selectStyles,
			css`
				.d2l-schedule-dialog-content {
					display: flex;
					flex-direction: column;
					padding: 0 6px;
				}
				.d2l-input-select {
					margin-bottom: 18px;
				}
				d2l-input-text {
					margin-bottom: 18px;
				}
				.d2l-invalid-form-alert {
					margin-bottom: 5px;
				}
				.d2l-ignore-list {
					margin-bottom: 15px;
				}
			`
		];
	}

	constructor() {
		super();

		this.scheduleService = ScheduleServiceFactory.getScheduleService();

		this.clearForm();
		this.semesters = [];
		this.openDialog = true;
		this._readyToShowDialog = false;
		this._closeActionType = null;
	}

	async connectedCallback() {
		super.connectedCallback();

		await this.fetchSemesters();

		if (this.scheduleId) {
			await this.fetchSchedule();
		}
	}

	async firstUpdated() {
		// Give the browser a chance to paint
		// we cannot open the dialog until browser has rendered the components
		// or we will get a focus error and cannot listen to events
		await new Promise((r) => setTimeout(r, 0));
		this._readyToShowDialog = true;

		this.shadowRoot.getElementById('scheduleName').focus();
	}

	render() {
		return html`
			<d2l-dialog
				class="d2l-schedule-dialog"
				?opened=${this._readyToShowDialog && this.openDialog}
				@d2l-dialog-close="${this.handleDialogClose}"
				title-text="${this.localize('scheduleDialog:title')}"
				id="${DIALOG_ID}">
				<div class="d2l-schedule-dialog-content">${this.renderForm()}</div>
				<div slot="footer" class="d2l-dialog-footer">
					<d2l-alert
						class="d2l-invalid-form-alert"
						type="warning"
						?hidden="${!this._invalidJsonField}">
						${this._invalidFormAlertMessage}
					</d2l-alert>
					<d2l-button
						?disabled="${this.saving}"
						@click="${this.saveForm}"
						primary>
						${this.localize('button:save')}
					</d2l-button>
					<d2l-button @click="${this.handleCancel}">
						${this.localize('button:cancel')}
					</d2l-button>
				</div>
			</d2l-dialog>
		`;
	}

	updated(changedProperties) {
		if (changedProperties.has('scheduleId')) {
			this.clearForm();
			this.fetchSchedule();
		}
	}

	clearForm() {
		this.scheduleName = '';
		this.scheduleJson = JSON_PLACEHOLDER;
		this.semesterId = null;
		this.sessionCode = '';
		this.subjectCode = '';
		this.moduleIgnoreList = [];
		this._missingSubjectOrSessionField = false;
		this._missingSemester = false;
		this._invalidSubjectField = false;
		this._invalidJsonField = false;
		this._invalidFormAlertMessage = '';
	}

	closeDialog(closeActionType = CANCEL_ACTION) {
		this._closeActionType = closeActionType;
		this.openDialog = false;
	}

	async fetchSchedule() {
		if (!this.scheduleId) {
			return;
		}
		await this.scheduleService.getSchedule(this.scheduleId).then(body => {
			this.scheduleName = body.scheduleName;
			this.scheduleJson = body.scheduleJson;
			this.semesterId = String(body.courseOfferingSemesterId);
			this.sessionCode = body.courseOfferingSessionCodeFilter;
			this.subjectCode = body.courseOfferingSubjectCodeFilter.join();
			this.moduleIgnoreList = body.moduleNameIgnoreList;
		});
	}

	async fetchSemesters() {
		this.semesters = (await this.scheduleService.getSemesters()).sort((a, b) =>
			parseInt(b.Identifier) - parseInt(a.Identifier)
		);
	}

	async finishClosingDialog(type) {
		this.scheduleId = null;
		this.clearForm();

		const closeDialog = new CustomEvent('schedule-dialog-closed', {
			bubbles: true,
			composed: true,
			detail: { type: type }
		});
		this.dispatchEvent(closeDialog);
	}

	handleCancel() {
		this.closeDialog(CANCEL_ACTION);
	}

	async handleDialogClose() {
		const closeActionType = this._closeActionType || CANCEL_ACTION;
		this._closeActionType = null;
		this.finishClosingDialog(closeActionType);
	}

	isValidForm() {
		// Check required fields
		let missingNameOrJson = false;
		if (!(this.scheduleName && this.scheduleJson)) {
			missingNameOrJson = true;
		}

		if (!(this.sessionCode || this.subjectCode)) {
			this._missingSubjectOrSessionField = true;
		}

		if (!this.semesterId) {
			this._missingSemester = true;
		}

		// Check alphanumeric comma separated value format
		const subjectCsvPattern = '^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$';
		if (this.subjectCode) {
			// Remove all whitespaces
			this.subjectCode = this.subjectCode.split(' ').join('');
			if (!this.subjectCode.match(subjectCsvPattern)) {
				this._invalidSubjectField = true;
			}
		}

		return !(missingNameOrJson || this._missingSubjectOrSessionField || this._invalidSubjectField || this._missingSemester);
	}

	renderForm() {
		return html`
			<label for="scheduleName" class="d2l-label-text">${this.localize('scheduleDialog:name')}</label>
			<d2l-input-text
				autocomplete="off"
				id="scheduleName"
				required
				value="${this.scheduleName || ''}"
				@change=${this._handleScheduleNameChange}
				label=${this.localize('scheduleDialog:name')}
				label-hidden>
			</d2l-input-text>

			<label for="semesterId" class="d2l-label-text">${this.localize('scheduleDialog:semester')}</label>
			<select
				aria-label=${this.localize('scheduleDialog:chooseSemester')}
				class="d2l-input-select"
				id="semesterId"
				required
				@change=${this._handleSemesterIdChange}
				aria-invalid="${this._missingSemester}">
				<option value="" disabled selected>${this.localize('scheduleDialog:selectSemester')}</option>
				${this.semesters.map((option) => this._renderSelectOptions(option, this.semesterId))}
			</select>
			${this._renderSemesterErrorToolTip()}

            <label for="subjectCode" class="d2l-label-text">${this.localize('scheduleDialog:subject')}</label>
			<d2l-input-text
				autocomplete="off"
				id="subjectCode"
				value="${this.subjectCode || ''}"
				@change=${this._handleSubjectCodeChange}
				label=${this.localize('scheduleDialog:subject')}
				label-hidden
				aria-invalid="${this._missingSubjectOrSessionField || this._invalidSubjectField}">
			</d2l-input-text>
			${this._renderSubjectErrorTooltip()}

            <label for="sessionCode" class="d2l-label-text">${this.localize('scheduleDialog:session')}</label>
			<d2l-input-text
				autocomplete="off"
				id="sessionCode"
				value="${this.sessionCode || ''}"
				@change=${this._handleSessionCodeChange}
				label=${this.localize('scheduleDialog:session')}
				label-hidden
				aria-invalid="${this._missingSubjectOrSessionField}">
			</d2l-input-text>
			${this._renderSessionErrorTooltip()}

			<label for="moduleIgnoreList" class="d2l-label-text">${this.localize('scheduleDialog:moduleIgnoreList')}</label>
			${this._renderModuleIgnoreList()}
			<d2l-input-text
				slot="input"
				id="moduleIgnoreList"
				label=${this.localize('scheduleDialog:moduleIgnoreList')}
				label-hidden
				placeholder="Press enter to add"
				@keypress=${this._onModuleIgnoreListKeyPress}>
			</d2l-input-text>

            <label for="scheduleJson" class="d2l-label-text">${this.localize('scheduleDialog:deliveryBlocks')}</label>
			<d2l-input-textarea
				autocomplete="off"
				id="scheduleJson"
                required
				value="${this.scheduleJson || ''}"
				@change=${this._handleScheduleJsonChange}
				placeholder=${JSON_PLACEHOLDER}
				label=${this.localize('scheduleDialog:deliveryBlocks')}
				label-hidden
				aria-invalid="${this._invalidJsonField}">
			</d2l-input-textarea>
			${this._renderJsonErrorTooltip()}
        `;
	}

	async saveForm() {
		if (!this.isValidForm()) {
			return;
		}

		this.saving = true;

		const schedule = {
			scheduleName: this.scheduleName,
			courseOfferingSemesterId: this.semesterId,
			courseOfferingSessionCodeFilter: this.sessionCode,
			courseOfferingSubjectCodeFilter: this.subjectCode.split(','),
			moduleNameIgnoreList: this.moduleIgnoreList,
			scheduleJson: this.scheduleJson
		};

		try {
			if (!this.scheduleId) {
				await this.scheduleService.createSchedule(schedule);
			}
			else {
				await this.scheduleService.updateSchedule(this.scheduleId, schedule);
			}
			this.closeDialog(SAVE_ACTION);
		} catch (err) {
			this._invalidFormAlertMessage = this.localize('scheduleDialog:jsonInvalidAlert');
			this._invalidJsonField = true;
		} finally {
			this.saving = false; // Always re-enable save button to try again
		}
	}

	_handleScheduleJsonChange(e) {
		this._invalidJsonField = false;
		this._invalidFormAlertMessage = '';
		this.scheduleJson = e.target.value;
	}

	_handleScheduleNameChange(e) {
		this.scheduleName = e.target.value;
	}

	_handleSemesterIdChange(e) {
		this.semesterId = e.target.value;
		this._missingSemester = false;
	}

	_handleSessionCodeChange(e) {
		this._missingSubjectOrSessionField = false;
		this.sessionCode = e.target.value;
	}

	_handleSubjectCodeChange(e) {
		this._missingSubjectOrSessionField = false;
		this._invalidSubjectField = false;
		this.subjectCode = e.target.value;
	}

	_onModuleIgnoreListKeyPress(e) {
		// 'Enter' key
		const value = e.target.value.trim();
		if (e.keyCode === 13 && value) {
			this.moduleIgnoreList.push(value);
			e.target.value = '';
			this.requestUpdate();
		}
	}

	_removeModuleIgnoreString(e) {
		this.moduleIgnoreList.splice(e.target.getAttribute('index'), 1);
		this.requestUpdate();
	}

	_renderJsonErrorTooltip() {
		if (this._invalidJsonField) {
			return html`
			<d2l-tooltip for="scheduleJson" state="error" align="start" offset="10">
				${this.localize('scheduleDialog:jsonInvalid')}
			</d2l-tooltip>
			`;
		}
	}

	_renderModuleIgnoreList() {
		return html`
			<d2l-labs-multi-select-list collapsable>
				${this.moduleIgnoreList.map((ignoreString, index) => html`
					<d2l-labs-multi-select-list-item
						text="${ignoreString}"
						index="${index}"
						deletable
						@d2l-labs-multi-select-list-item-deleted="${this._removeModuleIgnoreString}"
					>
					</d2l-labs-multi-select-list-item>
				`)}
			</d2l-labs-multi-select-list>
		`;
	}

	_renderSelectOptions(option, selectedOption) {
		return html`
			<option
				value="${option.Identifier}"
				?selected=${selectedOption === option.Identifier}
				>
				${option.Name}
			</option>
		`;
	}

	_renderSemesterErrorToolTip() {
		if (this._missingSemester) {
			return html`
			<d2l-tooltip for="semesterId" state="error" align="start" offset="10">
				${this.localize('scheduleDialog:semesterMissing')}
			</d2l-tooltip>
			`;
		}
	}

	_renderSessionErrorTooltip() {
		if (this._missingSubjectOrSessionField) {
			return html`
			<d2l-tooltip for="sessionCode" state="error" align="start" offset="10">
				${this.localize('scheduleDialog:subjectOrSessionMissing')}	
			</d2l-tooltip>
			`;
		}
	}

	_renderSubjectErrorTooltip() {
		if (this._missingSubjectOrSessionField) {
			return html`
			<d2l-tooltip for="subjectCode" state="error" align="start" offset="10">
				${this.localize('scheduleDialog:subjectOrSessionMissing')}
			</d2l-tooltip>
			`;
		}
		if (this._invalidSubjectField) {
			return html`
			<d2l-tooltip for="subjectCode" state="error" align="start" offset="10">
				${this.localize('scheduleDialog:subjectInvalid')}
			</d2l-tooltip>
			`;
		}
	}
}

customElements.define('module-scheduler-schedule-dialog', ScheduleDialog);
