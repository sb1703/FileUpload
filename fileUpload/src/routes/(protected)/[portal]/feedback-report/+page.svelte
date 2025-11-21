<script>
  import { page } from "$app/stores";
  import SaveIcon from "@lucide/svelte/icons/save";
  import Trash2Icon from "@lucide/svelte/icons/trash-2";
  import * as Accordion from "$lib/components/ui/accordion/index.js";
  import * as InputGroup from "$lib/components/ui/input-group/index.js";
  import SearchIcon from "@lucide/svelte/icons/search";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as HoverCard from "$lib/components/ui/hover-card/index.js";
  import Papa from "papaparse";
  import { toast } from "svelte-sonner";

  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import {
    DateFormatter,
    getLocalTimeZone,
    fromDate,
    parseDate
  } from "@internationalized/date";
  import { cn } from "$lib/utils.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";

  const df = new DateFormatter("en-US", {
    dateStyle: "long"
  });

  /**
   * @typedef {Object} File
   * @property {string} name - File name
   * @property {string} url - File URL
   */

  /** @type {{ file: File }} */
  let { data } = $props();
  const { file } = data;
  let isAdmin = $derived($page.data?.isAdmin ?? false);


  /** @type {string} */
  let search = $state("");

  let feedbacks = $state([]);

  let filteredFeedbacks = $derived.by(() =>
    feedbacks.filter(feedback => {
      const words = search.toLowerCase().split(/\s+/).filter(Boolean);
      const searchId = words.every(word => feedback.id.toLowerCase().includes(word));
      const searchEmail = words.every(word => feedback.email.toLowerCase().includes(word));
      const searchDate = words.every(word => feedback.date.toLowerCase().includes(word));
      const searchFeedback = words.every(word => feedback.feedback.toLowerCase().includes(word));
      return searchId || searchEmail || searchDate || searchFeedback;
    })
  );

  // Fetch and parse CSV on mount
  import { onMount } from "svelte";
  onMount(async () => {
    try {
      const res = await fetch(file.url);
      const csvText = await res.text();

      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

      feedbacks = parsed.data.map((row, i) => ({
        sno: i+1,
        id: row.id,
        email: row.email || "Unknown",
        date: row.date || "",
        feedback: row.feedback || "",
        actions: row.actions || "",
        date_of_action: row.date_of_action || "",
        outcome: row.outcome || "",
        dateOfActionValue: row.date_of_action ? fromDate(new Date(row.date_of_action)) : null,
      }));
    } catch (err) {
      console.error("Error loading feedback:", err);
    }
  });

  $effect(() => {
    feedbacks.forEach(fb => {
      fb.date_of_action = fb.dateOfActionValue ? fb.dateOfActionValue.toDate(getLocalTimeZone()).toISOString() : "";
    });
  })

  async function saveFeedback(fb) {
    try {
      const { dateOfActionValue, sno, ...rest } = fb;
      const res = await fetch(`feedback-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", feedback: rest })
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed to save feedback");
      toast.success("Feedback saved!");
    } catch (err) {
      console.error(err);
      toast.error("Error saving feedback");
    }
  }
</script>


<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
  <Button variant="link" href={file.url} download>Download CSV</Button>

  <InputGroup.Root  class="w-full sm:max-w-sm mr-4">
    <InputGroup.Input placeholder="Search..." bind:value={search}/>
    <InputGroup.Addon>
      <SearchIcon />
    </InputGroup.Addon>
  </InputGroup.Root>
</div>

<!-- Feedback Table -->
{#if filteredFeedbacks.length > 0}
  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head class="w-[1%]">SNo.</Table.Head>
        <Table.Head class="w-[1%]">Email</Table.Head>
        <Table.Head class="w-[1%]">Date</Table.Head>
        <Table.Head>Feedback</Table.Head>
        <Table.Head>Actions</Table.Head>
        <Table.Head class="w-[1%]">Date of Action</Table.Head>
        <Table.Head>Status (Open/Closed)</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each filteredFeedbacks as fb}
        <Table.Row>
          <Table.Cell>
            <HoverCard.Root>
              <HoverCard.Trigger class="cursor-pointer">
                {fb.sno}
              </HoverCard.Trigger>
              <HoverCard.Content>
                {fb.id}
              </HoverCard.Content>
            </HoverCard.Root>
          </Table.Cell>
          <Table.Cell>{fb.email}</Table.Cell>
          <Table.Cell>
            <Popover.Root>
              <Popover.Trigger
                class={cn(
                  buttonVariants({
                    variant: "outline",
                    class: "w-[280px] justify-start text-left font-normal"
                  }),
                  !fb.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {#if fb.date && !isNaN(new Date(fb.date))}
                  {df.format(new Date(fb.date))}
                {:else}
                  Pick a date
                {/if}
              </Popover.Trigger>
            </Popover.Root>
          </Table.Cell>
          <Table.Cell>
            <Textarea
              bind:value={fb.feedback}
              rows="2"
              disabled
            ></Textarea>
          </Table.Cell>
          <Table.Cell>
            <Textarea
              bind:value={fb.actions}
              rows="2"
              disabled={!isAdmin}
            ></Textarea>
          </Table.Cell>
          <Table.Cell>
            <Popover.Root>
              <Popover.Trigger
                class={cn(
                  buttonVariants({
                    variant: "outline",
                    class: "w-[280px] justify-start text-left font-normal"
                  }),
                  !fb.date_of_action && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {#if fb.date_of_action && !isNaN(new Date(fb.date_of_action))}
                  {df.format(new Date(fb.date_of_action))}
                {:else}
                  Pick a date
                {/if}
              </Popover.Trigger>
              {#if isAdmin}
                <Popover.Content class="w-auto p-0">
                  <Calendar
                    type="single"
                    bind:value={fb.dateOfActionValue}
                  />
                </Popover.Content>
              {/if}
            </Popover.Root>
          </Table.Cell>
          <Table.Cell>
            <Textarea
              bind:value={fb.outcome}
              rows="2"
              disabled={!isAdmin}
            ></Textarea>
          </Table.Cell>
          {#if isAdmin}
            <Table.Cell class="w-[1%]">
              <HoverCard.Root>
                <HoverCard.Trigger class="cursor-pointer">
                  <!-- Save Button -->
                  <Button
                    variant="secondary"
                    size="icon"
                    onclick={() => saveFeedback(fb)}
                  >
                    <SaveIcon class="h-4 w-4" />
                  </Button>
                </HoverCard.Trigger>
                <HoverCard.Content class="w-[100%] text-center">
                  Save
                </HoverCard.Content>
              </HoverCard.Root>
            </Table.Cell>
          {/if}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
{:else}
  <p class="text-gray-500 mt-4 text-center">No feedback available.</p>
{/if}
