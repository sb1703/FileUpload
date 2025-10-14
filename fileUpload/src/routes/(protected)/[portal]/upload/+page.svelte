<script>
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";

import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";

import * as Alert from "$lib/components/ui/alert/index.js";
import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";

import * as Item from "$lib/components/ui/item/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Progress } from "$lib/components/ui/progress/index.js";

import { PUBLIC_MAIL_DOMAIN } from '$env/static/public';

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

/**
 * Reference to the active XMLHttpRequest (for cancellation)
 * @type {XMLHttpRequest | null}
 */
let currentRequest = null;

/**
   * The user's email address used for passwordless authentication.
   *
   * @type {string}
   * @description
   * Bound to the email input field. The user must enter a valid email
   * from the allowed domain (`PUBLIC_MAIL_DOMAIN`).
   */
let email = $state("");

/** 
   * Regex-based validation derived from email input and PUBLIC_MAIL_DOMAIN
   * @type {boolean}
   */
let isValidDomain = $derived.by(() => {
  const domainRegex = new RegExp(`^[a-zA-Z0-9._%+-]+@${PUBLIC_MAIL_DOMAIN.replace(".", "\\.")}$`);
  return domainRegex.test(email);
});

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
        formData.append("email", email);

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
</script>


<!-- File Input -->
<Label for="file" class="text-2xl font-bold mb-4">Upload File</Label>

<Input aria-invalid={!isValidDomain} id="email" type="email" placeholder={`johndoe@${PUBLIC_MAIL_DOMAIN}`} bind:value={email} class="max-w-xs mb-4" />
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
                <AlertDialog.Title >You want to upload this file to {isValidDomain ? email: "everyone"}?</AlertDialog.Title>
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
