import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST({ request, params }) {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    const email = formData.get('email');

    if (!file) {
        return new Response(JSON.stringify({ message: 'No file uploaded' }), { status: 400 });
    }

    try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Sanitize email for filesystem (replace @ and .)
        const safeEmail = email
            ? email.replace(/[^a-zA-Z0-9_-]/g, '_')
            : '';

        // Choose folder and path
        const uploadDir = safeEmail
            ? path.join(process.cwd(), 'static', 'uploads', params.portal, safeEmail)
            : path.join(process.cwd(), 'static', 'uploads', params.portal);

        // 🆕 Ensure the folder exists
        await mkdir(uploadDir, { recursive: true });

        // Get current date/time in readable form
        const now = new Date();
        const dateStr = now
            .toISOString() // e.g. "2025-10-05T09:22:10.123Z"
            .replace('T', '_')
            .replace(/:/g, '-')
            .split('.')[0]; // remove milliseconds

        // Generate unique id
        const uniqueId = crypto.randomBytes(4).toString('hex'); // 8-char ID

        // Clean up original filename (no spaces, no special chars)
        const safeName = file.name.replace(/[^\w.-]/g, '_');

        // Combine them
        const newFileName = `${dateStr}_${uniqueId}_${safeName}`;
        const filePath = path.join(uploadDir, newFileName);

        // Write to disk
        await writeFile(filePath, buffer);

        return new Response(JSON.stringify({ message: 'File uploaded successfully!' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('File save error:', err);
        return new Response(JSON.stringify({ message: 'Error saving file' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
