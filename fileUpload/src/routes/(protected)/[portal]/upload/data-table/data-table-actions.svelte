<script>
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import { Button } from "$lib/components/ui/button/index.js";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import RenameButton from "./../../../../../components/rename-button.svelte";
import DeleteButton from "./../../../../../components/delete-button.svelte";
import { page } from "$app/stores";

/**
 * @typedef {Object} Props
 * @property {string} id
 */

/** @type {Props} */
let { currentName, id, uploadedAt } = $props();

/** @type {boolean} */
let showRenameDeleteAction = $derived.by(() => {
    const segments = $page.url.pathname.split("/").filter(Boolean);
    const location = segments[1];
    return location === "upload";
});

</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        {#snippet child({ props })}
            <Button
                {...props}
                variant="ghost"
                size="icon"
                class="relative size-8 p-0"
            >
                <span class="sr-only">Open menu</span>
                <EllipsisIcon />
            </Button>
        {/snippet}
    </DropdownMenu.Trigger>

    {#if showRenameDeleteAction || uploadedAt}
        <DropdownMenu.Content>
            <DropdownMenu.Group>
                {#if uploadedAt}
                    <DropdownMenu.Label>{uploadedAt}</DropdownMenu.Label>
                {/if}
                {#if showRenameDeleteAction}
                    <DropdownMenu.Item>
                        <button on:click|stopPropagation>
                            <RenameButton
                                {currentName}
                                {id}
                            />
                        </button>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item>
                        <button on:click|stopPropagation>
                            <DeleteButton
                                {currentName}
                                {id}
                            />
                        </button>
                    </DropdownMenu.Item>
                {/if}
            </DropdownMenu.Group>
        </DropdownMenu.Content>
    {/if}
</DropdownMenu.Root>
