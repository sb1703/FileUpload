import { createRawSnippet } from "svelte";
import { renderSnippet, renderComponent } from "$lib/components/ui/data-table/index.js";
import DataTableActions from "./data-table-actions.svelte";
import DataTableNameButton from "./data-table-name-button.svelte";
import IconCell from "./../../../../../components/icon-cell.svelte";
import DataTableNameCell from "./../../../../../components/data-table-name-cell.svelte";

/**
 * @typedef {Object} File
 * @property {string} id - Unique identifier for the file.
 * @property {string} icon - URL of the icon.
 * @property {string} name - Name of file.
 * @property {"file" | "folder"} [type] - Type of the item.
 * @property {string} basePath - The user's base path (e.g. "private/john_doe").
 * @property {string} [path] - Full path of the file or folder.
 * @property {string} uploadedAt - Upload date of file.
 */

export const columns = [
    {
        accessorKey: "icon",
        header: "",
        meta: { className: "w-[5%]" },
        cell: ({ row }) => renderComponent(IconCell, { icon: row.original.icon }),
    },
    {
        accessorKey: "name",
        meta: { className: "w-[92%]" },

        /**
     * Renders the header for the "name" column using the `DataTableNameButton` Svelte component.
     * @param {{ column: import("@tanstack/table-core").Column<File, unknown> }} param0 - Header context containing the column.
     * @returns {import("svelte").Snippet} Rendered Svelte component snippet.
     */
        header: ({ column }) =>
            renderComponent(DataTableNameButton, {
                onclick: column.getToggleSortingHandler(),
            }),
        cell: ({ row }) =>
            renderComponent(DataTableNameCell, {
                name: row.original.name,
                type: row.original.type,
                path: row.original.path,
                fileId: row.original.fileId,
            }),
    },
    // --- Added "actions" column ---
    {
        id: "actions",
        meta: { className: "w-[3%]" },

        /**
     * Renders the action buttons cell using a Svelte component.
     * @param {{ row: { original: File } }} param0 - Row data context.
     * @returns {import("svelte").Snippet} Rendered DataTableActions component.
     */
        cell: ({ row }) => {
            // Pass whatever data you need from the row
            return renderComponent(DataTableActions, { currentName: row.original.name, id: row.original.id, uploadedAt: row.original.uploadedAt });
        },
    },
];
