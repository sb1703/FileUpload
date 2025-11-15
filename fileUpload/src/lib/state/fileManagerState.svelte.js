import { PUBLIC_MAIL_DOMAIN } from "$env/static/public";

/**
 * Global File Manager State
 */
export let fileManagerState = $state({
	currentPath: "",
	items: [],
	email: "",

	get isValidDomain() {
		if (!this.email) return false;
		const domainRegex = new RegExp(
			`^[a-zA-Z0-9._%+-]+@${PUBLIC_MAIL_DOMAIN.replace(".", "\\.")}$`
		);
		return domainRegex.test(this.email);
	},

	get basePath() {
		if (this.email && this.isValidDomain) {
			return `private/${this.email.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
		} else {
			return "public";
		}
	},

	get fullPath() {
		return `${this.basePath}/${this.currentPath}`.replace(/\/+/g, "/");
	},

	async loadFolder(portal, path = "") {
		try {
			const fullPath = `${this.basePath}/${path}`.replace(/\/+/g, "/");
			const res = await fetch(`/${portal}/upload?path=${encodeURIComponent(fullPath)}`);
			if (!res.ok) throw new Error(`Failed to load folder: ${res.statusText}`);
			const json = await res.json();
			this.items = json.data;
			this.currentPath = path;
		} catch (err) {
			this.items = [];
			console.error("Error loading folder:", err);
		}
	},

	async loadHomeFolder(portal, email = "", path = "") {
		try {
			this.email = email;
			const fullPath = `${this.basePath}/${path}`.replace(/\/+/g, "/");
			const res = await fetch(`/${portal}/upload?path=${encodeURIComponent(fullPath)}`);
			if (!res.ok) throw new Error(`Failed to load folder: ${res.statusText}`);
			const json = await res.json();
			this.items = json.data;
			this.currentPath = path;
		} catch (err) {
			this.items = [];
			console.error("Error loading folder:", err);
		}
	},
});
