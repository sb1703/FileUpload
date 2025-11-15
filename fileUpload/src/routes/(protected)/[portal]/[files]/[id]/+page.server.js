import fs from "fs";
import path from "path";
import { error } from "@sveltejs/kit";

const BASE_UPLOADS = path.join(process.cwd(), "static", "uploads");

export async function load({ params }) {
    const portalRoot = path.join(BASE_UPLOADS, params.portal, "upload");

    if (!fs.existsSync(portalRoot)) {
        throw error(404, "Portal not found");
    }

    // 🔍 Recursively search for the file containing params.id
    const result = findFileById(portalRoot, params.id);

    if (!result) {
        throw error(404, "File not found");
    }

    const { fileName, fullPath } = result;

    // Extract parts from filename: date, id, safeName
    const parts = fileName.split("_");

    if (parts.length < 3) {
        throw error(500, "Invalid file format");
    }

    const dateStr = parts[0];          // YYYY-MM-DD
    const timeStr = parts[1];          // HH-MM-SS
    const uniqueId = parts[2];
    const safeName = parts.slice(3).join("_");

    // Convert to ISO date
    const isoDate = `${dateStr}T${timeStr.replace(/-/g, ":")}Z`;

    const formattedDate = new Date(isoDate).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    // Convert system file path → public URL
    const relativePath = fullPath
        .replace(process.cwd(), "")
        .replace(/\\/g, "/");

    const url = relativePath.replace("/static", "");

    return {
        file: {
            id: uniqueId,
            name: decodeURIComponent(safeName),
            date: formattedDate,
            url,
        }
    };
}

/**
 * Recursively finds a file whose name contains the given uniqueId.
 */
function findFileById(startDir, id) {
    const entries = fs.readdirSync(startDir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(startDir, entry.name);

        if (entry.isDirectory()) {
            const nested = findFileById(fullPath, id);
            if (nested) return nested;
        } else {
            if (entry.name.includes(id)) {
                return { fileName: entry.name, fullPath };
            }
        }
    }

    return null;
}
