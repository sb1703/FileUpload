<script>
import { page } from "$app/stores";
import { onMount } from "svelte";

let portal = $page.params.portal;
let authorized = $page.data.authorized;

let displayText = $state('');

const content = authorized 
    ? `Welcome to ${portal.charAt(0).toUpperCase() + portal.slice(1)} Portal...`
    : `You are not authorized to visit ${portal} Portal`;

const speed = 200;

function loopTyper(text, speed) {
    let index = 0;
    let forward = true;
    let lastTime = performance.now();

    function step(now) {
        if (now - lastTime >= speed) {
            if (forward) {
                displayText += text[index++];
                if (index >= text.length) forward = false;
            } else {
                displayText = displayText.slice(0, -1);
                index--;
                if (index <= 0) forward = true;
            }
            lastTime = now;
        }
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

onMount(() => loopTyper(content, speed));
</script>

<h1 class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[5rem] font-extrabold">
    {displayText}<span class="cursor">|</span>
</h1>

<style>
.cursor {
    display: inline-block;
    width: 1ch;
    animation: blink 1s infinite;
}
@keyframes blink {
0%, 50%, 100% { opacity: 1; }
25%, 75% { opacity: 0; }
}
</style>
