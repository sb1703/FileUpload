<script>
import { fileManagerState } from "$lib/state/fileManagerState.svelte.js";
import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
import * as HoverCard from "$lib/components/ui/hover-card/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { toast } from "svelte-sonner";
import { page } from "$app/stores";

let folderName = $state("");
let dialogOpen = $state(false);

/**
 * Handles folder creation with validation and encoding
 */
async function addFolder() {
    const trimmed = folderName.trim();

    if (!trimmed) {
        toast.error("Folder name cannot be empty");
        return;
    }

    try {
        const encodedName = encodeURIComponent(trimmed);
        const fullPath = `${fileManagerState.basePath}/${fileManagerState.currentPath}`.replace(/\/+/g, "/");

        const res = await fetch(`/${$page.params.portal}/upload`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: encodedName, // send encoded to server
                path: fullPath,
            }),
        });

        if (!res.ok) {
            const msg = (await res.json()).message || "Error creating folder";
            throw new Error(msg);
        }

        toast.success("Folder created successfully", {
            description: `Folder "${trimmed}" has been added.`,
        });

        await fileManagerState.loadFolder($page.params.portal, fileManagerState.currentPath); // refresh folder list
    } catch (err) {
        console.error("Error creating folder:", err);
        toast.error("Failed to create folder", {
            description: err.message || "Unexpected error occurred.",
        });
    } finally {
        dialogOpen = false; // close dialog
        folderName = ""; // ✅ reset input no matter what
    }
}
</script>

<Dialog.Root bind:open={dialogOpen}>
    <HoverCard.Root>
        <HoverCard.Trigger class="cursor-pointer">
            <Dialog.Trigger
                class={`${buttonVariants({ variant: "outline" })} !text-3xl cursor-pointer`}
            >+</Dialog.Trigger>
        </HoverCard.Trigger>
        <HoverCard.Content class="w-[100%] text-center">
            Add Folder
        </HoverCard.Content>
    </HoverCard.Root>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Add Folder</Dialog.Title>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="name" class="text-right">Folder Name</Label>
                <Input id="name" bind:value={folderName} class="col-span-3" />
            </div>
        </div>
        <Dialog.Footer>
            <Button type="submit" onclick={addFolder}>Add Folder</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

