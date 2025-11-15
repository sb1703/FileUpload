<script>
export let icon;
import { onMount } from "svelte";

let isDark = false;

onMount(() => {
    // Detect if root has dark mode
    isDark = document.documentElement.classList.contains("dark");

    // Watch for theme changes (if toggled later)
    const observer = new MutationObserver(() => {
        isDark = document.documentElement.classList.contains("dark");
    });
    observer.observe(document.documentElement, { attributes: true });
});
</script>

<div class="flex justify-center items-center">
    <img
        src={icon}
        alt="icon"
        class="w-6 h-6 transition"
        style="filter: {isDark ? 'invert(1) brightness(2)' : 'none'};"
    />
</div>
