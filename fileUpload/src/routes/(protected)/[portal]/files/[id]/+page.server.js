import fs from 'fs';
import path from 'path';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {

    const session = await locals.getSession();
    const email = session.user?.email;

    // Sanitize email for filesystem (replace @ and .)
    const safeEmail = email.replace(/[^a-zA-Z0-9_-]/g, '_');

    const privateUploadDir = path.join(process.cwd(), 'static', 'uploads', params.portal, safeEmail);
    const publicUploadDir = path.join(process.cwd(), 'static', 'uploads', params.portal);

    const publicFiles = fs.existsSync(publicUploadDir) ? fs.readdirSync(publicUploadDir) : [];
    const privateFiles = fs.existsSync(privateUploadDir) ? fs.readdirSync(privateUploadDir) : [];

    let match = privateFiles.find(file => file.includes(params.id));
    let url = match ? `/uploads/${params.portal}/${safeEmail}/${match}` : null;

    if (!match) {
        match = publicFiles.find(file => file.includes(params.id));
        url = match ? `/uploads/${params.portal}/${match}` : null;
    }

    if (!match || !url) throw error(404, 'File not found');

    // Extract date, id, name
    const parts = match.split('_');
    const rawDateStr = parts[0] + '_' + parts[1];
    const [datePart, timePart] = rawDateStr.split('_');
    const isoDateStr = `${datePart}T${timePart.replace(/-/g, ':')}Z`;

    const dateObj = new Date(isoDateStr);
    const date = dateObj.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const id = parts[2];
    const name = parts.slice(3).join('_');

    return {
        file: {
            id,
            name,
            date,
            url,
        }
    };
}
