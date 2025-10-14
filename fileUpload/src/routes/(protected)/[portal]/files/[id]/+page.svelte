<script>
import { Button } from "$lib/components/ui/button/index.js";
import { error } from '@sveltejs/kit';


/**
   * @typedef {Object} File
   * @property {string} id - Unique file ID
   * @property {string} name - File name
   * @property {string} date - Upload date
   * @property {string} url - File URL
   */

/**
   * @type {{ file: File }}
   */
export let data;
const { file } = data;
</script>

<h1 class="text-2xl font-bold mb-4">{file.name}</h1>
<p>Uploaded on: {file.date}</p>

<!-- Display file inline -->
<iframe
    src={file.url}
    width="100%"
    height="700rem"
    title={`Preview of ${file.name}`}
></iframe>

<!-- Optional download button -->
<Button variant="link" href={file.url} download>Download</Button>
