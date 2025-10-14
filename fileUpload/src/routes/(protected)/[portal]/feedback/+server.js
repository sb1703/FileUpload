import { mkdir, appendFile, access, writeFile, constants } from "fs/promises";
import path from "path";

/**
 * Ensures that a directory exists — creates it if not present.
 * @param {string} dirPath
 */
async function ensureDirExists(dirPath) {
    try {
        await access(dirPath, constants.F_OK);
    } catch {
        await mkdir(dirPath, { recursive: true });
    }
}

export async function POST({ request, locals }) {
    try {
        const { portal, feedback } = await request.json();

        const session = await locals.getSession();
        const email = session.user?.email;

        if (!portal || !feedback) {
            return new Response(
                JSON.stringify({ message: "Missing portal or feedback." }),
                { status: 400 }
            );
        }

        const uploadDir = path.join(process.cwd(), "static", "uploads", portal, "feedback");
        await ensureDirExists(uploadDir);

        const csvPath = path.join(uploadDir, "feedback.csv");

        // Add CSV header if file does not exist
        try {
            await access(csvPath);
        } catch {
            await writeFile(csvPath, `"email","portal","date","feedback"\n`);
        }

        // Escape quotes and commas in feedback for safe CSV
        const sanitizedFeedback = feedback.replace(/"/g, '""');
        const date = new Date().toISOString();
        const row = `"${email}","${portal}","${date}","${sanitizedFeedback}"\n`;

        // Append new feedback
        await appendFile(csvPath, row);

        return new Response(
            JSON.stringify({ message: "Feedback saved successfully!" }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (err) {
        console.error("Error saving feedback:", err);
        return new Response(
            JSON.stringify({ message: "Internal server error while saving feedback." }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
