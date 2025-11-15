import fs from "fs";
import { mkdir, access, writeFile, constants } from "fs/promises";
import path from "path";
import crypto from "crypto";
import Papa from "papaparse";

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

/**
 * Ensures that the CSV file exists and contains the correct header row.
 * @param {string} filePath
 */
async function ensureCsvHasHeader(filePath) {
    const HEADER = `"id","email","date","feedback","actions","date_of_action","outcome"\n`;

    try {
        await access(filePath);
    } catch {
        await writeFile(filePath, HEADER);
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

        // Ensure folder + file exist
        const uploadDir = path.join(process.cwd(), "static", "uploads", portal, "feedback");
        await ensureDirExists(uploadDir);

        const csvPath = path.join(uploadDir, "feedback.csv");
        await ensureCsvHasHeader(csvPath);

        // Read existing CSV
        const csv = fs.readFileSync(csvPath, "utf8");
        const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });

        // Prepare new row
        const id = crypto.randomUUID();
        const newRow = {
            id,
            email,
            date: new Date().toISOString(),
            feedback,
            actions: "",
            date_of_action: "",
            outcome: ""
        };

        // Append and unparse
        parsed.data.push(newRow);
        const newCsv = Papa.unparse(parsed.data);

        // Write file with final newline
        fs.writeFileSync(csvPath, newCsv + "\n", "utf8");

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
