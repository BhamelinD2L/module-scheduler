import { Routes } from './routes.js';

// This takes an object and returns a copy of that object with all the undefined
// keys filtered out
function filterUndefined(obj) {
	return Object.keys(obj).reduce((acc, key) => {
		if (obj[key] !== undefined) acc[key] = obj[key];

		return acc;
	}, {});
}

// This adds query parameters to a base url. This expects an object for the
// query parameters. If the queryParams is null/undefined or an object with no
// defined values, the base url is returned unchanged.
function addQueryParamsToUrl(baseUrl, queryParams) {
	if (!queryParams) return baseUrl;

	const searchParams = new URLSearchParams(filterUndefined(queryParams));

	if (!searchParams.toString()) return baseUrl;

	return `${baseUrl}?${searchParams.toString()}`;
}

export class Requests {

	static async addToIgnoreList(scheduleId, courseOfferingId) {
		await this._put(Routes.IgnoreListAdd(scheduleId, courseOfferingId));
	}

	static async deleteIgnoreListItems(scheduleId, courseOfferingIds = null) {
		const queryParams = {
			courseOfferingIds: courseOfferingIds ? courseOfferingIds.join() : undefined
		};

		await this._delete(Routes.IgnoreListDelete(scheduleId), queryParams);
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
		let bookmark;
		let semesters = [];
		do {
			const queryParams = {
				orgUnitType: semesterOrgUnitType.Id,
				bookmark: (bookmark) ? bookmark : ''
			};
			const body  = await this._get(Routes.Semesters(), queryParams);
			semesters = semesters.concat(body.Items);
			bookmark = body.PagingInfo.Bookmark;
			if (!body.PagingInfo.HasMoreItems) {
				break;
			}
		} while (bookmark);

		return semesters;
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

	static _delete(url, queryParams) {
		const options = this._options('DELETE');
		return this._fetch(addQueryParamsToUrl(url, queryParams), options);
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

	static _get(url, queryParams) {
		const options = this._options('GET');
		return this._fetch(
			addQueryParamsToUrl(url, queryParams),
			options
		).then(r => r.json());
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
