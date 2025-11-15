<script>
import '../app.css';
import '../lib/app.css';

import { page } from "$app/stores";
import { fileManagerState } from "$lib/state/fileManagerState.svelte.js";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import { Button } from "$lib/components/ui/button/index.js";
import { ModeWatcher } from "mode-watcher";
import SunIcon from "@lucide/svelte/icons/sun";
import MoonIcon from "@lucide/svelte/icons/moon";

import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import { toggleMode, setTheme } from "mode-watcher";

let themes = $state("dark");
/**
   * @typedef {object} props @property {() => any} children - child render function
   */

/** @type {props} */
let { children } = $props();
let currentPath = $derived($page.url?.pathname ?? "/");
let portal = $derived($page.params?.portal ?? "");
let isMaterial = $derived($page.data?.isMaterial ?? false);
let isHR = $derived($page.data?.isHR ?? false);
let isAdmin = $derived($page.data?.isAdmin ?? false);
let email = $derived($page.data?.session?.user?.email ?? "");
</script>

<nav class="flex justify-between items-center px-4 py-2 bg-background border-b border-border mb-4">
  {#if currentPath === '/' || currentPath === '/auth'}
    <!-- Left: Nav Links -->
    <div class="flex items-center gap-4">
      <Button variant="link" href="/">Home</Button>
      <Button variant="link" href="/employee">Employee</Button>
      {#if isMaterial}
	<Button variant="link" href="/material">Material</Button>
      {/if}
      {#if isHR}
	<Button variant="link" href="/hr">HR</Button>
      {/if}
      <Button variant="link" href="/auth">Sign In</Button>
    </div>
  {:else if portal}
    <!-- Left: Nav Links -->
    <div class="flex items-center gap-4">
      <Button variant="link" href="/.." size="icon" class="size-8">
	<ChevronLeftIcon />
      </Button>
      <Button variant="link" href="/{portal}">{portal.charAt(0).toUpperCase() + portal.slice(1)}</Button>
      {#if isAdmin}
	<Button variant="link" href="/{portal}/upload">Upload</Button>
      {/if}
      <Button variant="link" href="/{portal}/public" onclick={() => fileManagerState.loadHomeFolder($page.params.portal)}>Public</Button>
      <Button variant="link" href="/{portal}/private" onclick={() => fileManagerState.loadHomeFolder($page.params.portal, email)}>Private</Button>
      <Button variant="link" href="/{portal}/feedback">Feedback</Button>
      <Button variant="link" href="/{portal}/feedback-report">Feedback Report</Button>
    </div>
  {/if}

  <!-- Right: Dark Mode Switcher -->
  <div class="flex items-center gap-4">
    <DropdownMenu.Root class="relative">
      <DropdownMenu.Trigger>
	{#snippet child({ props })}
	  <Button {...props} variant="outline">Themes</Button>
	{/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content class="w-56">
	<DropdownMenu.Group>
	  <DropdownMenu.RadioGroup bind:value={themes}>
	    <DropdownMenu.RadioItem value="dark" onclick={() => setTheme("dark")}>Default</DropdownMenu.RadioItem>
	    <DropdownMenu.RadioItem value="modern-blue" onclick={() => setTheme("modern-blue")}>Modern Blue</DropdownMenu.RadioItem>
	    <DropdownMenu.RadioItem value="forest-green" onclick={() => setTheme("forest-green")}>Forest Green</DropdownMenu.RadioItem>
	    <DropdownMenu.RadioItem value="aquamarine-deep" onclick={() => setTheme("aquamarine-deep")}>Aquamarine Deep</DropdownMenu.RadioItem>
	    <DropdownMenu.RadioItem value="vivid-crimson" onclick={() => setTheme("vivid-crimson")}>Vivid Crimson</DropdownMenu.RadioItem>
	    <DropdownMenu.RadioItem value="sunset-orange" onclick={() => setTheme("sunset-orange")}>Sunset Orange</DropdownMenu.RadioItem>
	  </DropdownMenu.RadioGroup>
	</DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>

    <Button onclick={toggleMode} variant="outline" size="icon" class="relative">
      <SunIcon
	class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <MoonIcon
	class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
      <span class="sr-only">Toggle theme</span>
    </Button>
  </div>
</nav>

<ModeWatcher />

{@render children()}
