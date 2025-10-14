import fs from 'fs';
import path from 'path';
import { redirect } from '@sveltejs/kit';

export async function load({ parent, params, locals }) {
    const { authorized } = await parent();
    if (!authorized) {
        throw redirect(303, `/${params.portal}`);
    }

    const session = await locals.getSession();
    const email = session.user?.email;

    // Sanitize email for filesystem (replace @ and .)
    const safeEmail = email.replace(/[^a-zA-Z0-9_-]/g, '_');

    const privateUploadDir = path.join(process.cwd(), 'static', 'uploads', params.portal, safeEmail);
    const publicUploadDir = path.join(process.cwd(), 'static', 'uploads', params.portal);

    try {
        const readFiles = (dir, portalPath) => {
            // Ensure uploads directory exists
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Read all files
            const files = fs.readdirSync(dir)
            .filter(file => fs.statSync(path.join(dir, file)).isFile())
            .map((file) => {
                const parts = file.split('_');
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

                const id = parts[2];                   // unique ID
                const name = parts.slice(3).join('_'); // original filename

                return {
                    id,
                    date,
                    name,
                    url: `/uploads/${portalPath}/${file}`
                };
            });
            return files;
        };

        const publicFiles = readFiles(publicUploadDir, params.portal);
        const privateFiles = readFiles(privateUploadDir, `${params.portal}/${safeEmail}`);

        return { publicFiles, privateFiles };

    } catch (err) {
        console.error('Error reading uploads directory:', err);
        return { publicFiles: [], privateFiles: [] };
    }
}
