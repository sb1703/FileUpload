import fs from "fs";
import path from "path";
import { error, redirect } from "@sveltejs/kit";

export async function load({ parent, params, locals }) {
    const { authorized } = await parent();
    if (!authorized) {
        throw redirect(303, `/${params.portal}`);
    }

    const session = await locals.getSession();
    if(session.user?.role !== 'admin') {
        throw redirect(303, `/${params.portal}`);
    }

    const { portal } = params;

    const feedbackPath = path.join(process.cwd(), "static", "uploads", portal, "feedback", "feedback.csv");

    const url = `/uploads/${portal}/feedback/feedback.csv`;

    if (!fs.existsSync(feedbackPath)) {
        return {
            file: {
                name: "feedback.csv",
            }
        };
    }

    // Read feedback file contents
    const csvData = fs.readFileSync(feedbackPath, "utf-8");

    return {
        file: {
            name: "feedback.csv",
            url,
            csvData,
        }
    };
}
