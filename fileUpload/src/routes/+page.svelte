<script>
import { page } from "$app/stores";
import { signIn, signOut } from "@auth/sveltekit/client";
import { Button } from "$lib/components/ui/button/index.js";

let scroll = 0;
</script>

<svelte:window bind:scrollY={scroll} />

<div class="relative h-[200vh] flex flex-col items-center">
  <!-- Big Intro Text (Background) -->
  <h1
    class="absolute top-1/5 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-extrabold text-center text-black dark:text-white whitespace-nowrap w-screen opacity-5"
    style="z-index: 0;"
  >
    AIESL PORTAL
  </h1>

  <!-- Animated Plane + Placeholder (Foreground) -->
  <div class="relative flex justify-center items-center z-10 mt-40 scale-[1.5]">
    <!-- Background Placeholder -->
    <img
      src="/img/placeholder.png"
      alt="Placeholder"
      class="block"
    />

    <!-- Plane Image -->
    <img
      src="/img/plane.png"
      alt="Plane"
      class="absolute"
      style={`top: ${180 + scroll * 0.2}px; transform: translateY(-50%) scale(${1 + scroll / 1500}); transition: transform 0.1s ease-out;`}
    />
  </div>

  <!-- About Section -->
  <div class="mt-96 px-8 max-w-4xl text-center space-y-6">
    <h2 class="text-4xl font-bold text-black dark:text-white">About This Portal</h2>

    <p class="text-lg text-gray-700 dark:text-gray-300">
      Employees can upload files securely and provide feedback to different departments:
    </p>

    <ul class="list-disc list-inside text-lg text-gray-700 dark:text-gray-300 space-y-2">
      <li><strong>HR Department:</strong> Feedback related to policies, leave, or employee welfare.</li>
      <li><strong>Material Department:</strong> Requests or updates regarding inventory and resources.</li>
      <li><strong>General Feedback:</strong> Suggestions or issues accessible to all employees.</li>
    </ul>

    <Button href="/auth">Get Started</Button>
  </div>
</div>
