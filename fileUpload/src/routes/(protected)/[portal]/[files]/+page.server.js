import { redirect } from '@sveltejs/kit';

export async function load({ parent, params }) {
    const { authorized } = await parent();
    if (!authorized) {
        throw redirect(303, `/${params.portal}`);
    }
}
