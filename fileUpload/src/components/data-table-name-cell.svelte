<script>
import { fileManagerState } from "$lib/state/fileManagerState.svelte.js";
import { page } from "$app/stores";
import { goto } from "$app/navigation";
import { Button } from "$lib/components/ui/button/index.js";

/**
 * Props for the DataTableNameCell component.
 * @typedef {Object} DataTableNameCellProps
 * @property {string} name - Name of the file or folder.
 * @property {"file" | "folder"} [type] - Type of the item.
 * @property {string} path - Full path to the item (includes basePath).
 */

/** @type {DataTableNameCellProps} */
let { name, type, path, fileId } = $props();

let location = $derived.by(() => {
    const segments = $page.url.pathname.split("/").filter(Boolean);
    return segments[1];
});

function open() {
    if (type === "folder") {
        const relativePath = path.replace(`${fileManagerState.basePath}/`, "");
        fileManagerState.loadFolder($page.params.portal, relativePath);
    }
}
</script>

<Button
    variant="link"
    onclick={open}
    href={type === 'file' && (location === 'public' || location === 'private') ? `/${$page.params.portal}/${location}/${fileId}` : undefined}
>
    {decodeURIComponent(name)}
</Button>
