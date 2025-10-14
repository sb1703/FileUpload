<script>
import { Button } from "$lib/components/ui/button/index.js";
import * as Accordion from "$lib/components/ui/accordion/index.js";
import * as InputGroup from "$lib/components/ui/input-group/index.js";
import SearchIcon from "@lucide/svelte/icons/search";

/**
   * @typedef {Object} File
   * @property {string} id - Unique file ID
   * @property {string} name - File name
   * @property {string} date - Upload date
   */

/**
 * Props from the load function
 * @type {{ publicFiles: File[], privateFiles: File[] }}
 */
const { data } = $props();

/** @type {string} */
let search = $state("");

let filteredPublicFiles = $derived.by(() =>
    data.publicFiles.filter(file => {
        const words = search.toLowerCase().split(/\s+/).filter(Boolean);
        return words.every(word => file.name.toLowerCase().includes(word));
    })
);

let filteredPrivateFiles = $derived.by(() =>
    data.privateFiles.filter(file => {
        const words = search.toLowerCase().split(/\s+/).filter(Boolean);
        return words.every(word => file.name.toLowerCase().includes(word));
    })
);

</script>

<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
    <h1 class="text-2xl font-bold mb-4">Uploaded Files</h1>

    <InputGroup.Root  class="w-full sm:max-w-sm mr-4">
        <InputGroup.Input placeholder="Search..." bind:value={search}/>
        <InputGroup.Addon>
            <SearchIcon />
        </InputGroup.Addon>
    </InputGroup.Root>
</div>

<Accordion.Root type="multiple" class="w-full sm:max-w-[70%]" value="item-1">
    <Accordion.Item value="item-1">
        <Accordion.Trigger>Public Files</Accordion.Trigger>
        <Accordion.Content class="flex flex-col gap-4 text-balance">
            {#if filteredPublicFiles.length > 0}
                <ul>
                    {#each filteredPublicFiles as file}
                        <li class="flex justify-between items-center w-full">
                            <!-- Link to dynamic route -->
                            <Button variant="link" href={`files/${file.id}`}>
                                {file.name}
                            </Button>
                            <span style="margin-right: 1rem; color: gray;">
                                [{file.date}]
                            </span>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p>No files here.</p>
            {/if}
        </Accordion.Content>
    </Accordion.Item>
    <Accordion.Item value="item-2">
        <Accordion.Trigger>Private Files</Accordion.Trigger>
        <Accordion.Content class="flex flex-col gap-4 text-balance">
            {#if filteredPrivateFiles.length > 0}
                <ul>
                    {#each filteredPrivateFiles as file}
                        <li class="flex justify-between items-center w-full">
                            <!-- Link to dynamic route -->
                            <Button variant="link" href={`files/${file.id}`}>
                                {file.name}
                            </Button>
                            <span style="margin-right: 1rem; color: gray;">
                                [{file.date}]
                            </span>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p>No files here.</p>
            {/if}
        </Accordion.Content>
    </Accordion.Item>
</Accordion.Root>
