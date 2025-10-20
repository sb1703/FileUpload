<script>
import { page } from "$app/stores";
import { onMount } from "svelte";
import { goto } from "$app/navigation";

/**
   * Redirect user to home if no session is available
   */
onMount(() => {
	if (!$page.data?.session) {
		goto("/auth"); // redirect to home
	}
});

/**
   * @typedef {Object} Props @property {() => any} children - Child render function
   */

/** @type {Props} */
let { children } = $props();
</script>

{#if $page.data?.session}
	<main class="ml-6">
		{@render children()}
	</main>
{/if}
