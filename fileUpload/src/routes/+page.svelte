<script>
import { page } from "$app/stores";
import { signIn, signOut } from "@auth/sveltekit/client";
import { Button } from "$lib/components/ui/button/index.js";

let scroll = $state(0);
let innerHeight = $state(0);
let scrollRatio = $derived(scroll / innerHeight);
let planeTop = $derived(Math.min(50 + scrollRatio * 5, 100));
</script>

<svelte:window bind:scrollY={scroll} bind:innerHeight={innerHeight} />

<div class="relative h-[200vh] flex flex-col items-center">
  <!-- Animated Plane + Placeholder (Foreground) -->
  <div class="relative flex justify-center items-center w-full h-screen" style="transform: scale(1);">
    <!-- Background Text -->
    <h1
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-extrabold text-center text-black dark:text-white whitespace-nowrap opacity-5"
      style="font-size: 10vw; z-index: 0;"
    >
      AIESL PORTAL
    </h1>

    <!-- Placeholder -->
    <img src="/img/placeholder.png" alt="Placeholder" class="block w-1/4 h-auto" />

    <!-- Plane -->
    <img
      src="/img/plane.png"
      alt="Plane"
      class="absolute w-1/4 h-auto"
      style={`top: ${Math.min(50 + scroll * 0.01, 100)}vh; transform: translateY(-50%) scale(${1 + scrollRatio * 0.8}); transition: transform 0.1s ease-out;`}
    />
  </div>

  <!-- About Section -->
  <div class="relative flex flex-col justify-center items-center w-full min-h-screen text-center px-4" style="gap: 2vh;">
    <h2 class="font-bold text-black dark:text-white" style="font-size: 3vw; max-font-size: 3rem;">
      About This Portal
    </h2>

    <p class="text-gray-700 dark:text-gray-300" style="font-size: 1.25vw; max-font-size: 1.25rem; max-width: 80ch;">
      Employees can upload files securely and provide feedback to different departments:
    </p>

    <ul class="list-disc list-inside text-gray-700 dark:text-gray-300" style="font-size: 1.25vw; max-font-size: 1rem; gap: 1vh;">
      <li><strong>HR Department:</strong> Feedback related to policies, leave, or employee welfare.</li>
      <li><strong>Material Department:</strong> Requests or updates regarding inventory and resources.</li>
      <li><strong>General Feedback:</strong> Suggestions or issues accessible to all employees.</li>
    </ul>

    <Button
      href="/auth"
      class="px-4 py-2 rounded-md"
      style="font-size: clamp(14px, 1.5vw, 18px);"
    >
      Get Started
    </Button>
  </div>
</div>
