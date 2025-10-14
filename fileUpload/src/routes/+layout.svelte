<script>
import '../app.css';
import '../lib/app.css';

/**
   * @typedef {object} props @property {() => any} children - child render function
   */

/** @type {props} */
let { children } = $props();
</script>

{@render children()}
