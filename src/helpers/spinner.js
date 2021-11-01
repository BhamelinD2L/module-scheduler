import { html } from 'lit-element/lit-element';

export function renderSpinner() {
	return html`
		<d2l-loading-spinner
			class="d2l-spinner"
			size=100>
		</d2l-loading-spinner>
	`;
}
