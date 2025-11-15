import fs from "fs";
import path from "path";
import { json } from "@sveltejs/kit";
import Papa from "papaparse";

export async function POST({ request, params }) {
    const { portal } = params;
    const { action, feedback } = await request.json();

    const feedbackPath = path.join(process.cwd(), "static", "uploads", portal, "feedback", "feedback.csv");

    if (!fs.existsSync(feedbackPath)) {
        return json({ success: false, message: "Feedback file not found" });
    }

    let csv = fs.readFileSync(feedbackPath, "utf-8");
    let parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });

    // For save
    const index = parsed.data.findIndex(row => row.id === feedback.id);
    if (index === -1) return json({ success: false, message: "Row not found" });

    if (action === "save") {
        parsed.data[index].actions = feedback.actions;
        parsed.data[index].date_of_action = feedback.date_of_action;
        parsed.data[index].outcome = feedback.outcome;
    }

    // Convert back to CSV
    const newCsv = Papa.unparse(parsed.data);
    fs.writeFileSync(feedbackPath, newCsv + "\n", "utf-8");
    return json({ success: true });
}
