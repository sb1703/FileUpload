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
        date: row.date ? new Date(row.date).toLocaleString("en-IN") : "Unknown",
        feedback: row.feedback || "",
      }));
    } catch (err) {
      console.error("Error loading feedback:", err);
    }
  });

  async function saveFeedback(fb) {
    try {
      const res = await fetch(`feedback-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", feedback: fb })
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed to save feedback");
      alert("Feedback saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving feedback");
    }
  }

  async function deleteFeedback(fb) {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      const res = await fetch(`feedback-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", feedback: fb })
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed to delete feedback");
      // Remove from frontend array
      feedbacks = feedbacks.filter(f => f.id !== fb.id);
    } catch (err) {
      console.error(err);
      alert("Error deleting feedback");
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
          <Table.Cell>{fb.date}</Table.Cell>
          <Table.Cell>
            <Textarea
              bind:value={fb.feedback}
              rows="2"
              disabled={!isAdmin}
            ></Textarea>
          </Table.Cell>
          {#if isAdmin}
            <Table.Cell class="w-[1%]">
              <!-- Save Button -->
              <Button
                variant="secondary"
                size="icon"
                onclick={() => saveFeedback(fb)}
              >
                <SaveIcon class="h-4 w-4" />
              </Button>

              <!-- Delete Button -->
              <Button
                variant="secondary"
                size="icon"
                onclick={() => deleteFeedback(fb)}
              >
                <Trash2Icon class="h-4 w-4" />
              </Button>
            </Table.Cell>
          {/if}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
{:else}
  <p class="text-gray-500 mt-4 text-center">No feedback available.</p>
{/if}
