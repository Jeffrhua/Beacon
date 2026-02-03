<script lang="ts">
  import { Badge } from "flowbite-svelte";
  let {severity="low"} = $props();
</script>
<div>
    {#if severity == "low"}
        <Badge color="green">Low</Badge>
    {:else if severity == "medium"}
        <Badge color="yellow">Medium</Badge>
    {:else if severity == "high"}
        <Badge class="bg-[#dc0000] dark:bg-[#dc0000] text-white">High</Badge>
    {:else if severity == "critical"}
        <Badge class="bg-[#780000] dark:bg-[#780000] text-white dark:text-white">Critical</Badge>
    {/if}
</div>

