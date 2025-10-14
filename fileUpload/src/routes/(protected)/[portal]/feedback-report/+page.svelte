<script>
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Accordion from "$lib/components/ui/accordion/index.js";
  import Papa from "papaparse";

  /**
   * @typedef {Object} File
   * @property {string} name - File name
   * @property {string} url - File URL
   */

  /** @type {{ file: File }} */
  export let data;
  const { file } = data;

  let feedbacks = [];

  // Fetch and parse CSV on mount
  import { onMount } from "svelte";
  onMount(async () => {
    try {
      const res = await fetch(file.url);
      const csvText = await res.text();

      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

      feedbacks = parsed.data.map((row, i) => ({
        id: i,
        email: row.email || "Unknown",
        date: row.date ? new Date(row.date).toLocaleString("en-IN") : "Unknown",
        feedback: row.feedback || "",
      }));
    } catch (err) {
      console.error("Error loading feedback:", err);
    }
  });
</script>

<!-- Feedback Accordion -->
{#if feedbacks.length > 0}
  <Accordion.Root type="multiple" class="w-full sm:max-w-[70%] mx-auto">
    {#each feedbacks as fb}
      <Accordion.Item value={`item-${fb.id}`}>
        <Accordion.Trigger>
          <div class="flex justify-between items-center w-full">
            <span class="font-semibold">{fb.email}</span>
            <span class="text-sm text-gray-500">{fb.date}</span>
          </div>
        </Accordion.Trigger>

        <Accordion.Content class="flex flex-col gap-4 text-balance">
          <p class="whitespace-pre-wrap">{fb.feedback}</p>
        </Accordion.Content>
      </Accordion.Item>
    {/each}
  </Accordion.Root>
{:else}
  <p class="text-gray-500 mt-4 text-center">No feedback available.</p>
{/if}

<!-- Download button -->
<div class="mt-4">
  <Button variant="link" href={file.url} download>Download CSV</Button>
</div>
