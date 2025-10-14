<script>
import { page } from "$app/stores";

let portal = $page.params.portal;
let authorized = $page.data.authorized;
</script>

{#if authorized}
    <h1 class="text-2xl font-bold mb-4">Welcome to {portal} Portal...</h1>
{:else}
    <h1 class="text-2xl font-bold mb-4">You are not authorized to visit {portal} Portal</h1>
{/if}
