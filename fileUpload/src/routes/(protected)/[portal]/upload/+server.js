import { readdir, stat, mkdir, rm, rename, writeFile, access, constants } from "fs/promises";
import path from 'path';
import crypto from 'crypto';

const BASE_UPLOADS = path.join(process.cwd(), "static", "uploads");

export async function POST({ request, params }) {
    // Determine if this is a file upload or folder creation
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const file = formData.get('file');
        const rawFullPath = formData.get('fullPath') || '';
        const fullPath = decodeURIComponent(rawFullPath).replace(/^\/|\/$/g, ''); // remove leading/trailing slashes

        if (!file) {
            return new Response(JSON.stringify({ message: 'No file uploaded' }), { status: 400 });
        }

        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const safeName = encodeURIComponent(file.name);
            const uniqueId = crypto.randomBytes(4).toString('hex');
            const now = new Date();
            const dateStr = now.toISOString().replace('T', '_').replace(/:/g, '-').split('.')[0];

            const uploadDir = path.join(process.cwd(), 'static', 'uploads', params.portal, 'upload', fullPath);
            await mkdir(uploadDir, { recursive: true });

            const filePath = path.join(uploadDir, `${dateStr}_${uniqueId}_${safeName}`);

            await writeFile(filePath, buffer);

            return new Response(JSON.stringify({ message: 'File uploaded successfully!' }), { status: 200 });
        } catch (err) {
            console.error('File save error:', err);
            return new Response(JSON.stringify({ message: 'Error saving file', error: err.message }), { status: 500 });
        }
    } else if (contentType.includes("application/json")) {
        // === Folder creation ===
        const { name, path: folderPath } = await request.json();
        const dirPath = getPortalPath(params.portal, folderPath);

        try {
            const decodedName = decodeURIComponent(name);
            await mkdir(path.join(dirPath, decodedName));
            return new Response(JSON.stringify({ message: "Folder created" }), { status: 200 });
        } catch (err) {
            console.error("Error creating folder:", err);
            return new Response(JSON.stringify({ message: "Error creating folder" }), { status: 500 });
        }
    } else {
        return new Response(JSON.stringify({ message: "Unsupported content type" }), { status: 400 });
    }
}

function getPortalPath(portal, folderPath = "") {
    return path.join(BASE_UPLOADS, portal, "upload", folderPath);
}

// LIST FILES/FOLDERS
export async function GET({ url, params }) {
    const folderPath = url.searchParams.get("path") || "";
    const dirPath = getPortalPath(params.portal, folderPath);
    console.error(folderPath, dirPath);

    try {
        const entries = await readdir(dirPath, { withFileTypes: true });
        const data = await Promise.all(
            entries.map(async (entry) => {
                const entryPath = path.join(dirPath, entry.name);
                const stats = await stat(entryPath);
                const isFolder = entry.isDirectory();
                let fileMeta = {};
                if (!isFolder) {
                    // Example filename: 2025-01-30_14-55-33_9f2ac123_test.png
                    const parts = entry.name.split("_");

                    if (parts.length >= 3) {
                        const datePart = parts[0];
                        const timePart = parts[1];
                        const uniqueId = parts[2];
                        const safeName = parts.slice(3).join("_");
                        const originalName = decodeURIComponent(safeName);

                        // Convert back to ISO → Date
                        const isoDate = `${datePart}T${timePart.replace(/-/g, ":")}Z`;
                        const dateObj = new Date(isoDate);

                        const formattedDate = dateObj.toLocaleString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                        });

                        fileMeta = {
                            fileId: uniqueId,
                            uploadedAt: formattedDate,
                            safeName,
                            originalName
                        };
                    }
                }
                return {
                    id: crypto.randomUUID(),
                    name: fileMeta?.originalName ?? entry.name,
                    type: isFolder ? "folder" : "file",
                    icon: isFolder ? "/img/folder.svg" : "/img/file.svg",
                    path: path.posix.join("/", folderPath, entry.name),
                    size: !isFolder ? stats.size : undefined,

                    ...fileMeta
                };
            })
        );
        return new Response(JSON.stringify({ data }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ message: "Error reading directory", folderPath: folderPath, dirPath: dirPath }), { status: 500 });
    }
}

// RENAME FILE/FOLDER
export async function PATCH({ request, params }) {
    const { oldName, newName, path: folderPath } = await request.json();
    const dirPath = getPortalPath(params.portal, folderPath);

    const oldPath = path.join(dirPath, decodeURIComponent(oldName));
    const newPath = path.join(dirPath, decodeURIComponent(newName));

    try {
        await access(oldPath, constants.F_OK);

        try {
            await access(newPath, constants.F_OK);
            return new Response(
                JSON.stringify({ message: "A folder with this name already exists." }),
                { status: 400 }
            );
        } catch {
            // OK — doesn’t exist
        }

        await rename(oldPath, newPath);
        return new Response(JSON.stringify({ message: "Renamed successfully" }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ message: "Error renaming" }), { status: 500 });
    }
}

// DELETE FILE/FOLDER
export async function DELETE({ request, params }) {
    const { name, path: folderPath } = await request.json();
    const dirPath = getPortalPath(params.portal, folderPath);
    try {
        await rm(path.join(dirPath, decodeURIComponent(name)), { recursive: true, force: true });
        return new Response(JSON.stringify({ message: "Deleted successfully" }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ message: "Error deleting" }), { status: 500 });
    }
}
