import { AppRoutes } from '../helpers/app-routes.js';
import page from 'page';

export const BaseMixin = (superclass) => class extends superclass {
	navigateTo(path, state) {
		page(path, state);
	}

	redirectToNotFound() {
		window.location.href = AppRoutes.NotFound();
	}
};
