<script>
import { page } from "$app/stores";
import { onMount } from "svelte";
import { goto } from "$app/navigation";

import { ModeWatcher } from "mode-watcher";
import { Button } from "$lib/components/ui/button/index.js";
import SunIcon from "@lucide/svelte/icons/sun";
import MoonIcon from "@lucide/svelte/icons/moon";

import { toggleMode } from "mode-watcher";

/**
   * Redirect user to home if no session is available
   */
onMount(() => {
	if (!$page.data?.session) {
		goto("/"); // redirect to home
	}
});

/**
   * @typedef {Object} Props @property {() => any} children - Child render function
   */

/** @type {Props} */
let { children } = $props();

let portal = $page.params.portal;
</script>

<nav class="flex justify-between items-center px-4 py-2 bg-background border-b border-border mb-4">
	<!-- Left: Nav Links -->
	<div class="flex items-center gap-4">
		<Button variant="link" href="/{portal}">{portal.charAt(0).toUpperCase() + portal.slice(1)}</Button>
		{#if $page.data?.isAdmin}
			<Button variant="link" href="/{portal}/upload">Upload</Button>
		{/if}
		<Button variant="link" href="/{portal}/files">Files</Button>
		<Button variant="link" href="/{portal}/feedback">Feedback</Button>
		{#if $page.data?.isAdmin}
			<Button variant="link" href="/{portal}/feedback-report">Feedback Report</Button>
		{/if}
	</div>

	<!-- Right: Dark Mode Switcher -->
	<Button onclick={toggleMode} variant="outline" size="icon" class="relative">
		<SunIcon
			class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
		/>
		<MoonIcon
			class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
		/>
		<span class="sr-only">Toggle theme</span>
	</Button>
</nav>

<ModeWatcher />

{#if $page.data?.session}
	<main class="ml-6">
		{@render children()}
	</main>
{/if}
