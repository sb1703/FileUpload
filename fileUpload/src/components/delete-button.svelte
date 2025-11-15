<script>
import { fileManagerState } from "$lib/state/fileManagerState.svelte.js";
import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
import * as HoverCard from "$lib/components/ui/hover-card/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { toast } from "svelte-sonner";
import { page } from "$app/stores";

/** @type {DataTableProps<any, any>} */
let { currentName, id } = $props();

let dialogOpen = $state(false);

async function deleteItem() {

    try {
        const fullPath = `${fileManagerState.basePath}/${fileManagerState.currentPath}`.replace(/\/+/g, "/");

        const res = await fetch(`/${$page.params.portal}/upload`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: currentName,
                path: fullPath,
            }),
        });

        if (!res.ok) {
            const msg = (await res.json()).message || "Error deleting file/folder";
            throw new Error(msg);
        }

        toast.success("Deleted successfully");

        await fileManagerState.loadFolder($page.params.portal, fileManagerState.currentPath);
    } catch (err) {
        toast.error("Failed to delete file/folder", {
            description: err.message || "Unexpected error occurred.",
        });
    } finally {
        dialogOpen = false; // close dialog
    }
}
</script>

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Trigger>Delete</Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Delete File/Folder</Dialog.Title>
        </Dialog.Header>
        <Dialog.Description>
            Are you sure you want to delete "{currentName}"? This action cannot be undone.
        </Dialog.Description>
        <Dialog.Footer>
            <Button type="submit" onclick={deleteItem}>Delete</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

