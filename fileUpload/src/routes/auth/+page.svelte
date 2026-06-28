<script>
import { page } from "$app/stores";
import { signIn, signOut } from "@auth/sveltekit/client";
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import * as Alert from "$lib/components/ui/alert/index.js";
import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";

import { PUBLIC_MAIL_DOMAIN, PUBLIC_DEV_AUTO_AUTH_EMAIL } from '$env/static/public';

/**
   * The user's email address used for passwordless authentication.
   *
   * @type {string}
   * @description
   * Bound to the email input field. The user must enter a valid email
   * from the allowed domain (`PUBLIC_MAIL_DOMAIN`).
   */
let email = $state("");
/** 
   * Loading flag: true while an async operation is running
   * @type {boolean}
   */
let loading = $state(false);

/**
   * Error message: undefined when no error, string if an error occurs
   * @type {string | undefined}
   */
let error = $state(undefined);

/**
   * Success message: undefined when no success, string if operation succeeds
   * @type {string | undefined}
   */
let success = $state(undefined);

/** 
   * Regex-based validation derived from email input and PUBLIC_MAIL_DOMAIN
   * @type {boolean}
   */
let isValidDomain = $derived.by(() => {
  const domainRegex = new RegExp(`^[a-zA-Z0-9._%+-]+@${PUBLIC_MAIL_DOMAIN.replace(".", "\\.")}$`);
  return domainRegex.test(email);
});

/**
   * Sends a passwordless magic link to the user's email address
   * via Auth.js + Nodemailer provider.
   *
   * @async
   * @function handleMagicLink
   * @throws {Error} When sending the magic link fails (e.g. invalid email or network issue).
   * @returns {Promise<void>}
   *
   * @example
   * ```js
   * await handleMagicLink();
   * ```
   *
   * @description
   * - Validates the domain before proceeding.
   * - Calls `signIn("email")` from `@auth/sveltekit/client` to trigger
   *   the email provider flow.
   * - Redirects to `/` after successful login (as defined by `redirectTo`).
   */
async function handleMagicLink() {
  error = undefined;
  success = undefined;

  if (PUBLIC_DEV_AUTO_AUTH_EMAIL && email === PUBLIC_DEV_AUTO_AUTH_EMAIL) {
    loading = true;
    try {
      await signIn("credentials", { email, redirectTo: "/" });
      success = "Logged in as admin (dev auto-login)";
    } catch (err) {
      error = "Dev auto-login failed.";
      console.error(err);
    } finally {
      loading = false;
    }
    return;
  }

  if (!isValidDomain) {
    error = `Email must be a ${PUBLIC_MAIL_DOMAIN} address`;
    return;
  }

  loading = true;
  try {
    await signIn("email", { email, redirect: false });
    success = "Magic link sent! Check your email.";
  } catch (err) {
    error = "We couldn't send the magic link. Please check your connection and try again.";
    console.error("Failed to send magic link:", err);
  } finally {
    loading = false;
  }
}

let session = $derived($page.data?.session ?? false);
</script>

<h1 class="text-2xl font-bold mb-4 ml-6">Sign In</h1>

<div class="flex flex-col gap-4 w-2/3 max-w-md ml-6">
  {#if session}
    <form class="flex w-full max-w-sm items-center space-x-2">
      <span class="text-sm">
	Signed in as <strong>{session.user?.email}</strong>
      </span>
      <Button variant="ghost" onclick={() => signOut()}>
	Sign Out
      </Button>
    </form>
  {:else}
    {#if !success}
      <form class="flex w-full max-w-sm items-center space-x-2">
	<Input aria-invalid={!isValidDomain} id="email" type="email" placeholder={`johndoe@${PUBLIC_MAIL_DOMAIN}`} bind:value={email} class="max-w-xs" />
	<Button onclick={handleMagicLink} disabled={!isValidDomain}>
	  {#if loading}
	    <Spinner />
	  {:else}
	    Sign In
	  {/if}
	</Button>
      </form>
    {/if}
    <!-- Alert -->
    {#if error || success}
      <div class="mt-4 w-full max-w-xl">
	<Alert.Root variant={error ? "error" : "success"}>
	  {#if error}
	    <AlertCircleIcon class="h-5 w-5" />
	    <Alert.Title>Error</Alert.Title>
	    <Alert.Description>{error}</Alert.Description>
	  {:else if success}
	    <CheckCircle2Icon class="h-5 w-5" />
	    <Alert.Title>Success</Alert.Title>
	    <Alert.Description>{success}</Alert.Description>
	  {/if}
	</Alert.Root>
      </div>
    {/if}
  {/if}
</div>
