import '@brightspace-ui/core/components/dialog/dialog.js';
import '@brightspace-ui/core/components/inputs/input-text';
import '@brightspace-ui/core/components/inputs/input-textarea';
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
				type: Number
			},
			scheduleName: {
				type: String
			},
			scheduleJson: {
				type: Object
			},
			semesterId: {
				type: Number
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
			_readyToShowDialog: {
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
				d2l-loading-spinner {
					height: 600px;
				}
			`
		];
	}

	constructor() {
		super();

		this.scheduleService = ScheduleServiceFactory.getScheduleService();

		this.clearForm();
		this.semesters = [];
		this._readyToShowDialog = false;
	}

	async connectedCallback() {
		super.connectedCallback();

		this.semesters = await this.scheduleService.getSemesters();
		this.semesterId = this.semesters[0]?.Identifier;

		if (this.scheduleId) {
			this.fetchSchedule();
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
				?opened=${this._readyToShowDialog}
				@d2l-dialog-close="${this.cancelDialog}"
				title-text="${this.localize('scheduleDialog:title')}"
				id="${DIALOG_ID}">
				<div class="d2l-schedule-dialog-content">${this.renderForm()}</div>
				<div slot="footer" class="d2l-dialog-footer">
					<span class="d2l-dialog-footer-left">
						<d2l-button
							?disabled="${this.saving}"
							@click="${this.saveForm}"
							primary>
							${this.localize('button:save')}
						</d2l-button>
						<d2l-button @click="${this.cancelDialog}">
							${this.localize('button:cancel')}
						</d2l-button>
					</span>
				</div>
			</d2l-dialog>
		`;
	}

	updated(changedProperties) {
		if (changedProperties.has('scheduleId')) {
			this.fetchSchedule();
		}
	}

	async cancelDialog() {
		this.closeDialog(CANCEL_ACTION);
	}

	clearForm() {
		this.scheduleName = '';
		this.scheduleJson = '';
		this.semesterId = null;
		this.sessionCode = '';
		this.subjectCode = '';
		this.moduleIgnoreList = [];
	}

	async closeDialog(type) {
		this.scheduleId = null;
		this.clearForm();

		const closeDialog = new CustomEvent('schedule-dialog-closed', {
			bubbles: true,
			composed: true,
			detail: { type: type }
		});
		this.dispatchEvent(closeDialog);
	}

	fetchSchedule() {
		if (!this.scheduleId) {
			return;
		}
		this.scheduleService.getSchedule(this.scheduleId).then(body => {
			this.scheduleName = body.scheduleName;
			this.scheduleJson = body.scheduleJson;
			this.semesterId = body.courseOfferingSemesterId;
			this.sessionCode = body.courseOfferingSessionCodeFilter;
			this.subjectCode = body.courseOfferingSubjectCodeFilter;
			this.moduleIgnoreList = body.moduleNameIgnoreList;
		});
	}

	isValidForm() {
		// front-end validation here
		return true;
	}

	renderForm() {
		if (this.scheduleId && !(this.scheduleName || this.semesterId || this.moduleIgnoreList)) {
			return html`<d2l-loading-spinner size="100"></d2l-loading-spinner>`;
		}

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
				@change=${this._handleSemesterIdChange}>
				${this.semesters.map((option) => this.renderSelectOptions(option, this.semesterId))}
			</select>

            <label for="sessionCode" class="d2l-label-text">${this.localize('scheduleDialog:session')}</label>
			<d2l-input-text
				autocomplete="off"
				id="sessionCode"
				value="${this.sessionCode || ''}"
				@change=${this._handleSessionCodeChange}
				label=${this.localize('scheduleDialog:session')}
				label-hidden>
			</d2l-input-text>

            <label for="subjectCode" class="d2l-label-text">${this.localize('scheduleDialog:subject')}</label>
			<d2l-input-text
				autocomplete="off"
				id="subjectCode"
				value="${this.subjectCode || ''}"
				@change=${this._handleSubjectCodeChange}
				label=${this.localize('scheduleDialog:subject')}
				label-hidden>
			</d2l-input-text>

			<label for="moduleIgnoreList" class="d2l-label-text">${this.localize('scheduleDialog:moduleIgnoreList')}</label>
			<d2l-input-text
				autocomplete="off"
				id="moduleIgnoreList"
				value="${this.moduleIgnoreList || ''}"
				@change=${this._handleModuleIgnoreListChange}
				label=${this.localize('scheduleDialog:moduleIgnoreList')}
				label-hidden>
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
				label-hidden>
			</d2l-input-textarea>
        `;
	}

	renderSelectOptions(option, selectedOption) {
		return html`
			<option
				value="${option.Identifier}"
				?selected=${selectedOption === option.Identifier}
				>
				${option.Name}
			</option>
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
			courseOfferingSubjectCodeFilter: this.subjectCode,
			moduleNameIgnoreList: this.moduleIgnoreList,
			scheduleJson: this.scheduleJson
		};

		let savePromise = !this.scheduleId
			? this.scheduleService.createSchedule(schedule)
			: this.scheduleService.updateSchedule(this.scheduleId, schedule);

		savePromise
			.then(() => {
				this.closeDialog(SAVE_ACTION);
			})
			.catch(() => {
				// TODO: handle errors
			})
			.finally(() => {
				this.saving = false; // Always re-enable save button to try again
			});
	}

	_handleModuleIgnoreListChange(e) {
		this.moduleIgnoreList = e.target.value;
	}

	_handleScheduleJsonChange(e) {
		this.scheduleJson = e.target.value;
	}

	_handleScheduleNameChange(e) {
		this.scheduleName = e.target.value;
	}

	_handleSemesterIdChange(e) {
		this.semesterId = e.target.value;
	}

	_handleSessionCodeChange(e) {
		this.sessionCode = e.target.value;
	}

	_handleSubjectCodeChange(e) {
		this.subjectCode = e.target.value;
	}
}

customElements.define('module-scheduler-schedule-dialog', ScheduleDialog);
