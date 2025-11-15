<script>
import DataTable from "../upload/data-table/data-table.svelte";
import { columns } from "../upload/data-table/column.js";
import { fileManagerState } from "$lib/state/fileManagerState.svelte.js";
import { page } from "$app/stores";
import { onMount } from "svelte";
import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";

import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import * as HoverCard from "$lib/components/ui/hover-card/index.js";

const { data } = $props();
</script>

<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
    <h1 class="text-2xl font-bold mb-4">Uploaded Files</h1>
</div>

<div class="!max-w-none w-[70vw] h-[90vh] flex flex-col overflow-hidden">
    <div class="!flex-row justify-between items-center">
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
    </div>
    <div class="grid gap-4 py-4">
        <DataTable data={fileManagerState.items} columns={columns} />
    </div>
</div>
