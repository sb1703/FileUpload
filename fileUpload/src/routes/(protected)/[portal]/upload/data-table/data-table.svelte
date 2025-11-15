<script>
import { Button } from "$lib/components/ui/button/index.js";
import {
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/table-core";
import { Input } from "$lib/components/ui/input/index.js";
import {
    createSvelteTable,
    FlexRender,
} from "$lib/components/ui/data-table/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import AddFolderButton from "./../../../../../components/add-folder-button.svelte";
import { page } from "$app/stores";

/**
 * @template TData, TValue
 * @typedef {Object} DataTableProps
 * @property {import("@tanstack/table-core").ColumnDef<TData, TValue>[]} columns - Column definitions for the data table.
 * @property {TData[]} data - Array of data objects to render.
 */

/**
 * @typedef {Object} PaginationState
 * @property {number} pageIndex - Current page index.
 * @property {number} pageSize - Number of rows per page.
 */

/**
 * @typedef {import("@tanstack/table-core").SortingState} SortingState
 * Array representing current sorting configuration.
 */

/** @type {DataTableProps<any, any>} */
let { data, columns } = $props();

/** @type {PaginationState} */
let pagination = $state({ pageIndex: 0, pageSize: 10 });

/** @type {SortingState} */
let sorting = $state([]);

/** @type {ColumnFiltersState} */
let columnFilters = $state([]);

/** @type {boolean} */
let showAddFolder = $derived.by(() => {
    const segments = $page.url.pathname.split("/").filter(Boolean);
    const location = segments[1];
    return location === "upload";
});

/** @type {import("@tanstack/table-core").Table<any>} */
const table = createSvelteTable({
    get data() {
        return data;
    },
    columns,
    state: {
        get pagination() {
            return pagination;
        },
        get sorting() {
            return sorting;
        },
        get columnFilters() {
            return columnFilters;
        },
    },
    /**
   * Handles updates to the sorting state.
   * @param {SortingState | ((old: SortingState) => SortingState)} updater - Function or object to update sorting.
   */
    onSortingChange: (updater) => {
        if (typeof updater === "function") {
            sorting = updater(sorting);
        } else {
            sorting = updater;
        }
    },
    /**
   * Handles pagination state updates.
   * @param {PaginationState | ((old: PaginationState) => PaginationState)} updater - A function or object to update pagination.
   */
    onPaginationChange: (updater) => {
        if (typeof updater === "function") {
            pagination = updater(pagination);
        } else {
            pagination = updater;
        }
    },
    /**
     * Handles updates to the column filter state.
     * @param {import("@tanstack/table-core").ColumnFiltersState | ((old: import("@tanstack/table-core").ColumnFiltersState) => import("@tanstack/table-core").ColumnFiltersState)} updater 
     * Function or object used to update column filters.
     */
    onColumnFiltersChange: (updater) => {
        if (typeof updater === "function") {
            columnFilters = updater(columnFilters);
        } else {
            columnFilters = updater;
        }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
});
</script>

<div>
    <div class="flex justify-between items-center py-4">
        <Input
            placeholder="Search..."
            value={(table.getColumn("name")?.getFilterValue()) ?? ""}
            onchange={(e) => {
                table.getColumn("name")?.setFilterValue(e.currentTarget.value);
            }}
            oninput={(e) => {
                table.getColumn("name")?.setFilterValue(e.currentTarget.value);
            }}
            class="max-w-sm"
        />
        {#if showAddFolder}
            <AddFolderButton />
        {/if}
    </div>
    <div class="rounded-md border">
        <Table.Root>
            <Table.Header>
                {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
                    <Table.Row>
                        {#each headerGroup.headers as header (header.id)}
                            <Table.Head colspan={header.colSpan} class={header.column.columnDef.meta?.className}>
                                {#if !header.isPlaceholder}
                                    <FlexRender
                                        content={header.column.columnDef.header}
                                        context={header.getContext()}
                                    />
                                {/if}
                            </Table.Head>
                        {/each}
                    </Table.Row>
                {/each}
            </Table.Header>

            <Table.Body>
                {#each table.getRowModel().rows as row (row.id)}
                    <Table.Row data-state={row.getIsSelected() && "selected"}>
                        {#each row.getVisibleCells() as cell (cell.id)}
                            <Table.Cell class={cell.column.columnDef.meta?.className}>
                                <FlexRender
                                    content={cell.column.columnDef.cell}
                                    context={cell.getContext()}
                                />
                            </Table.Cell>
                        {/each}
                    </Table.Row>
                {:else}
                    <Table.Row>
                        <Table.Cell colspan={columns.length} class="h-24 text-center">
                            No results.
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>

    <!-- Pagination Controls -->
    <div class="flex items-center justify-end space-x-2 py-4">
        <Button
            variant="outline"
            size="sm"
            onclick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
        >
            Previous
        </Button>

        <Button
            variant="outline"
            size="sm"
            onclick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
        >
            Next
        </Button>
    </div>
</div>
