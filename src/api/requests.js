import { Routes } from './routes.js';

// This takes an object and returns a copy of that object with all the undefined
// keys filtered out
function filterUndefined(obj) {
	return Object.keys(obj).reduce((acc, key) => {
		if (obj[key] !== undefined) acc[key] = obj[key];

		return acc;
	}, {});
}

export class Requests {

	static async addToIgnoreList(scheduleId, courseOfferingId) {
		await this._put(Routes.IgnoreListAdd(scheduleId, courseOfferingId));
	}

	static async deleteSchedule(scheduleId) {
		await this._delete(Routes.DeleteSchedule(scheduleId));
	}

	static async getAllSchedules() {
		return await this._get(Routes.AllSchedules());
	}

	static async getIgnoreList(scheduleId, search, pageSize, pageNumber) {
		const queryParams = {
			search: search ? search : undefined,
			pageSize,
			pageNumber
		};

		return await this._get(Routes.IgnoreList(scheduleId), queryParams);
	}

	static async getIgnoreListCount(scheduleId, search) {
		const queryParams = { search: search ? search : undefined };

		return await this._get(Routes.IgnoreListCount(scheduleId), queryParams);
	}

	static async getSchedule(scheduleId) {
		return await this._get(Routes.Schedule(scheduleId));
	}

	static async getSemesters() {
		const semesterOrgUnitType = await this._get(Routes.SemesterOrgUnitType());
		return await this._get(Routes.Semesters(semesterOrgUnitType.Id));
	}

	static async postSchedule(schedule) {
		return await this._post(Routes.SaveNewSchedule(), JSON.stringify(schedule));
	}

	static async putSchedule(scheduleId, schedule) {
		return await this._put(Routes.UpdateSchedule(scheduleId), JSON.stringify(schedule));
	}

	static async runSchedule(scheduleId) {
		await this._post(Routes.RunSchedule(scheduleId));
	}

	// Helper Methods

	static get _xsrfToken() {
		return D2L && D2L.LP && D2L.LP.Web && D2L.LP.Web.Authentication &&
			D2L.LP.Web.Authentication.Xsrf &&
			D2L.LP.Web.Authentication.Xsrf.GetXsrfToken &&
			D2L.LP.Web.Authentication.Xsrf.GetXsrfToken() || '';
	}

	static _delete(url) {
		const options = this._options('DELETE');
		return this._fetch(url, options);
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

	static _get(baseUrl, queryParams) {
		let url = baseUrl;

		if (queryParams) {
			const searchParams = new URLSearchParams(filterUndefined(queryParams));

			if (searchParams.toString()) url = `${url}?${searchParams.toString()}`;
		}

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
