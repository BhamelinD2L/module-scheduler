import page from 'page';

export const BaseMixin = (superclass) => class extends superclass {
	navigateTo(path, state) {
		page(path, state);
	}
};
