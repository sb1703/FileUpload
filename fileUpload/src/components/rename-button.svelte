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

let name = $state(currentName);
let dialogOpen = $state(false);

async function renameItem() {
    const trimmed = name.trim();

    if (!trimmed) {
        toast.error("File/Folder name cannot be empty");
        return;
    }

    try {
        const encodedName = encodeURIComponent(trimmed);
        const fullPath = `${fileManagerState.basePath}/${fileManagerState.currentPath}`.replace(/\/+/g, "/");

        const res = await fetch(`/${$page.params.portal}/upload`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                oldName: encodeURIComponent(currentName),
                newName: encodedName,
                path: fullPath,
            }),
        });

        if (!res.ok) {
            const msg = (await res.json()).message || "Error renaming file/folder";
            throw new Error(msg);
        }

        toast.success("Renamed successfully");

        await fileManagerState.loadFolder($page.params.portal, fileManagerState.currentPath);
    } catch (err) {
        toast.error("Failed to rename file/folder", {
            description: err.message || "Unexpected error occurred.",
        });
    } finally {
        dialogOpen = false; // close dialog
        name = ""; // ✅ reset input no matter what
    }
}
</script>

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Trigger>Rename</Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Rename File/Folder</Dialog.Title>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="name" class="text-right">Name</Label>
                <Input id="name" bind:value={name} class="col-span-3" />
            </div>
        </div>
        <Dialog.Footer>
            <Button type="submit" onclick={renameItem}>Rename</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

