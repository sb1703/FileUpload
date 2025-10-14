import { redirect, error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export const load = async (event) => {
	const session = await event.locals.getSession();
	if (!session) {
		throw redirect(303, '/');
	}

	const isAdmin = session.user?.role === 'admin';

	const email = session.user?.email;
	const portal = event.params.portal;

	if(portal === 'employee') return { session, authorized: true, isAdmin };

	const csvFile = path.join(process.cwd(), 'static', `${portal}.csv`);

	if (!fs.existsSync(csvFile)) {
		return {
			session,
			authorized: false
		}
	}

	const csvData = fs.readFileSync(csvFile, 'utf-8');
	const allowedEmails = csvData
	.split('\n')
	.map((line) => line.trim())
	.filter(Boolean);

	const isAuthorized = allowedEmails.includes(email);

	return {
		session,
		authorized: isAuthorized,
		isAdmin,
	};
};
