import { redirect } from '@sveltejs/kit';

export async function load({ parent, params, locals }) {
    const { authorized } = await parent();
    if (!authorized) {
        throw redirect(303, `/${params.portal}`);
    }

    const session = await locals.getSession();
    if(session.user?.role !== 'admin') {
        throw redirect(303, `/${params.portal}`);
    }
}
