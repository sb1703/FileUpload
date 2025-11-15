<script>
import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
import { Button } from "$lib/components/ui/button/index.js";

/**
 * @typedef {import("svelte").ComponentProps<typeof Button>} ButtonProps
 * Props accepted by the Button component.
 */

/**
 * Props passed to this component.
 * @type {{ variant?: ButtonProps["variant"] } & Omit<ButtonProps, "variant">}
 */
let props = $props();

/**
 * Variant of the button (default: "ghost").
 * @type {ButtonProps["variant"]}
 */
let variant = props.variant ?? "ghost";

/**
 * Other props to forward to the Button component.
 * @type {Omit<ButtonProps, "variant">}
 */
let restProps = { ...props };
delete restProps.variant;
</script>

<Button {variant} {...restProps}>
    Name
    <ArrowUpDownIcon class="ml-2" />
</Button>
