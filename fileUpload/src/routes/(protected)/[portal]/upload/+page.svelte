<script>
import { fileManagerState } from "$lib/state/fileManagerState.svelte.js";
import { page } from "$app/stores";
import { get } from "svelte/store";
import { onMount } from "svelte";
import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";

import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import * as HoverCard from "$lib/components/ui/hover-card/index.js";

import * as Alert from "$lib/components/ui/alert/index.js";
import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";

import * as Item from "$lib/components/ui/item/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Progress } from "$lib/components/ui/progress/index.js";

import DataTable from "./data-table/data-table.svelte";
import { columns } from "./data-table/column.js";

import { PUBLIC_MAIL_DOMAIN } from '$env/static/public';

let { data } = $props();
/** @type {File | null} */
let file = $state(null);
/** @type {string} */
let alertMessage = $state("");
/** @type {"success" | "destructive"} */
let alertType = $state("success");
/** @type {boolean} */
let showAlert = $state(false);
/** @type {boolean} */
let isUploading = $state(false);
/** @type {number} */
let progress = $state(0);
/** @type {boolean} */
let dialogOpen = $state(false);

/** @type {boolean} */
let selectDialogOpen = $state(false);

/** @type {string} */
let selectedPath = $state("");

$effect(() => {
    if(fileManagerState.email) {
        selectedPath = "";
    }
})

function confirmFolderSelection() {
    selectedPath = fileManagerState.currentPath;
    selectDialogOpen = false;
}

/**
 * Reference to the active XMLHttpRequest (for cancellation)
 * @type {XMLHttpRequest | null}
 */
let currentRequest = null;

/**
   * Upload the selected file
   */
async function uploadFile() {
    if (!file) {
        alertMessage = "Please select a file first.";
        alertType = "destructive";
        showAlert = true;
        return;
    }

    isUploading = true;
    progress = 0;
    showAlert = false;

    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fullPath", encodeURIComponent(fileManagerState.fullPath));

        // Example with fetch + tracking upload progress
        const xhr = new XMLHttpRequest();
        currentRequest = xhr;
        xhr.open("POST", "upload");

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                progress = Math.round((event.loaded / event.total) * 100);
            }
        };

        xhr.onload = () => {
            isUploading = false;
            const resOk = xhr.status >= 200 && xhr.status < 300;
            const resData = JSON.parse(xhr.responseText || "{}");
            alertMessage = resData.message || (resOk ? "File uploaded successfully!" : "Upload failed");
            alertType = resOk ? "success" : "destructive";
            showAlert = true;
            currentRequest = null;
        };

        xhr.onerror = () => {
            isUploading = false;
            alertMessage = "An error occurred while uploading the file.";
            alertType = "destructive";
            showAlert = true;
            currentRequest = null;
        };

        xhr.onabort = () => {
            isUploading = false;
            alertMessage = "Upload cancelled by user.";
            alertType = "destructive";
            showAlert = true;
            currentRequest = null;
        };

        xhr.send(formData);
    } catch (err) {
        console.error(err);
        isUploading = false;
        alertMessage = "An error occurred while uploading the file.";
        alertType = "destructive";
        showAlert = true;
    }
}

/**
 * Cancels the active upload (if any)
 */
function cancelUpload() {
    if (currentRequest) {
        currentRequest.abort();
    }
}

onMount(() => {
    fileManagerState.email = "";
});
</script>



<div class="max-w-ws mb-8">
    <Label for="email" class="text-xl font-bold mb-2">Upload To</Label>
    <Input aria-invalid={!fileManagerState.isValidDomain} id="email" type="email" placeholder={`johndoe@${PUBLIC_MAIL_DOMAIN}`} bind:value={fileManagerState.email} class="max-w-xs mb-1" />
    {#if fileManagerState.email && !fileManagerState.isValidDomain}
        <p class="text-sm text-red-500 mt-1">
            Please enter a valid email address ending with <strong>@{PUBLIC_MAIL_DOMAIN}</strong>.
        </p>
    {:else}
        <p class="text-sm text-gray-500">
            Leave blank to upload <strong>for everyone</strong>.
        </p>
    {/if}
</div>


<div class="max-w-ws mb-8">
    <Label for="folder" class="text-xl font-bold mb-2">Select Folder</Label>
    <Dialog.Root bind:open={selectDialogOpen}>
        <Dialog.Trigger onclick={() => fileManagerState.loadFolder($page.params.portal, "")} class={buttonVariants({ variant: "outline" })}>Select</Dialog.Trigger>
        {#if selectedPath}
            <p class="mt-2 text-sm">Selected Path: <strong>/Home{selectedPath}</strong></p>
        {:else}
            <p class="mt-2 text-sm">Selected Path: <strong>/Home</strong></p>
        {/if}
        <Dialog.Content class="!max-w-none w-[70vw] h-[90vh] flex flex-col overflow-hidden">
            <Dialog.Header class="!flex-row justify-between items-center">
                <Breadcrumb.Root>
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link class="cursor-pointer hover:underline" onclick={() => fileManagerState.loadFolder($page.params.portal, "")}>Home</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        {#each fileManagerState.currentPath.split("/").filter(Boolean) as part, i (i)}
                            <Breadcrumb.Separator />
                            <Breadcrumb.Item>
                                <Breadcrumb.Link
                                    class="cursor-pointer hover:underline"
                                    onclick={() => {
                                        fileManagerState.loadFolder($page.params.portal, fileManagerState.currentPath.split("/").filter(Boolean).slice(0, i + 1).join("/"));
                                    }}
                                >
                                    {part}
                                </Breadcrumb.Link>
                            </Breadcrumb.Item>
                        {/each}
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </Dialog.Header>
            <div class="grid gap-4 py-4">
                <DataTable data={fileManagerState.items} columns={columns} />
            </div>
            <Dialog.Footer>
                <Button onclick={confirmFolderSelection} type="submit">Select</Button>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>
</div>

<!-- File Input -->
<Label for="file" class="text-xl font-bold mb-2">Upload File</Label>
<div class="flex items-center gap-2 w-full max-w-md">
    <div class="grid w-full max-w-sm items-center gap-1.5">
        <Input id="file" type="file" onchange={(e) => (file = e.target.files?.[0])} />
    </div>
    <AlertDialog.Root bind:open={dialogOpen}>
        <AlertDialog.Trigger asChild>
            <Button variant="ghost">Upload</Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content>
            <AlertDialog.Header>
                <AlertDialog.Title>
                    You want to upload this file to 
                    {fileManagerState.isValidDomain ? fileManagerState.email : "everyone"} 
                    {selectedPath ? ` in /Home${selectedPath}` : " in /Home"}?
                </AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Footer>
                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                <AlertDialog.Action onclick={() => {uploadFile(); dialogOpen = false;}}>
                    Upload
                </AlertDialog.Action>
            </AlertDialog.Footer>
        </AlertDialog.Content>
    </AlertDialog.Root>
</div>

<!-- Uploading Item -->
{#if isUploading}
    <div class="flex w-full max-w-md flex-col gap-4 [--radius:1rem]">
        <Item.Root variant="outline">
            <Item.Media variant="icon">
                <Spinner />
            </Item.Media>
            <Item.Content>
                <Item.Title>Uploading...</Item.Title>
                <Item.Description  class="truncate max-w-[200px]">{file?.name} ({progress}% completed)</Item.Description>
            </Item.Content>
            <Item.Actions class="hidden sm:flex">
                <Button variant="outline" size="sm" onclick={cancelUpload}>Cancel</Button>
            </Item.Actions>
            <Item.Footer>
                <Progress value={progress} />
            </Item.Footer>
        </Item.Root>
    </div>
{/if}

<!-- Alert -->
{#if showAlert}
    <div class="mt-4 w-full max-w-xl">
        <Alert.Root variant={alertType}>
            {#if alertType === "success"}
                <CheckCircle2Icon class="h-5 w-5" />
            {:else}
                <AlertCircleIcon class="h-5 w-5" />
            {/if}
            <Alert.Title>{alertType === "success" ? "Success!" : "Error"}</Alert.Title>
            <Alert.Description>{alertMessage}</Alert.Description>
        </Alert.Root>
    </div>
{/if}
