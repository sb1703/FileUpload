import fs from 'fs';
import path from 'path';

export const load = async (event) => {
    const session = await event.locals.getSession();
    if (!session) {
        return {
            session,
        };
    }
    const email = session.user?.email;

    // Helper function to check if email exists in CSV
    const checkCsv = (fileName) => {
        const csvPath = path.join(process.cwd(), 'static', fileName);
        if (!fs.existsSync(csvPath)) return false;

        const csvData = fs.readFileSync(csvPath, 'utf-8');
        const allowedEmails = csvData
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

        return allowedEmails.includes(email);
    };

    const isMaterial = checkCsv('material.csv');
    const isHR = checkCsv('hr.csv');

    return {
        session,
        isMaterial,
        isHR
    };
};
