import { css, html, LitElement } from 'lit-element';
import { LocalizeMixin } from './src/mixins/localize-mixin.js';

class ModuleScheduler extends LocalizeMixin(LitElement) {

	static get properties() {
		return {
			orgUnitId: {
				type: String
			}
		};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
		`;
	}

	constructor() {
		super();
	}

	render() {
		return html`
			<h2>${this.localize('PageTitle')}</h2>
		`;
	}

}
customElements.define('d2l-module-scheduler', ModuleScheduler);
