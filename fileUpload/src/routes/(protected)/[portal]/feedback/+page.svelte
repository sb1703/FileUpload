<script>
import { Button } from "$lib/components/ui/button/index.js";
import { Textarea } from "$lib/components/ui/textarea/index.js";
import { page } from "$app/stores";

import * as Alert from "$lib/components/ui/alert/index.js";
import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";

/** @type {string} */
let feedback = $state("");
/** @type {string} */
let alertMessage = $state("");
/** @type {"success" | "destructive"} */
let alertType = $state("success");
/** @type {boolean} */
let isSubmitting = $state(false);

async function submitFeedback() {
    if (!feedback.trim()) {
        alertMessage = "Feedback cannot be empty!";
        alertType = "destructive";
        return;
    }

    isSubmitting = true;
    const portal = $page.params.portal;

    try {
        const res = await fetch(`feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ portal, feedback })
        });

        const data = await res.json();

        alertMessage = data.message;
        alertType = res.ok ? "success" : "destructive";

        if (res.ok) feedback = "";
    } catch (err) {
        alertMessage = "Error saving feedback.";
        alertType = "destructive";
        console.error(err);
    } finally {
        isSubmitting = false;
    }
}
</script>

<div class="grid w-full gap-2 mb-4">
    <Textarea placeholder="Feedback Here..." bind:value={feedback}/>
</div>
<Button onclick={submitFeedback} disabled={isSubmitting}>
    {isSubmitting ? "Saving..." : "Send Feedback"}
</Button>


{#if alertMessage}
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
