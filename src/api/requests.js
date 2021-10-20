import { Routes } from './routes.js';

export class Requests {
	static async getAllSchedules() {
		return await this._get(Routes.AllSchedules());
	}

	static async getSemesters() {
		return await this._get(Routes.Semesters());
	}

	// Helper Methods

	static get _xsrfToken() {
		return D2L && D2L.LP && D2L.LP.Web && D2L.LP.Web.Authentication &&
			D2L.LP.Web.Authentication.Xsrf &&
			D2L.LP.Web.Authentication.Xsrf.GetXsrfToken &&
			D2L.LP.Web.Authentication.Xsrf.GetXsrfToken() || '';
	}

	static async _fetch(url, options) {
		return await fetch(url, options)
			.then(response => {
				if (!response.ok) {
					throw Error(response.statusText);
				}
				return response;
			});
	}

	static _get(url) {
		const options = this._options('GET');
		return this._fetch(url, options).then(r => r.json());
	}

	static _options(method) {
		return {
			credentials: 'include',
			headers: new Headers({
				'Access-Control-Allow-Origin': '*',
				'X-Csrf-Token': this._xsrfToken
			}),
			method: method,
			mode: 'cors',
		};
	}

	static _post(url, body) {
		const options = this._options('POST');
		options.body = body;
		return this._fetch(url, options);
	}

	static _put(url, body) {
		const options = this._options('PUT');
		options.body = body;
		return this._fetch(url, options);
	}
}
