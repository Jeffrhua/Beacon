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
        <Badge class="bg-[#f67e7e] text-[#822a2a]">High</Badge>
    {:else if severity == "critical"}
        <Badge class="bg-[#9e0000] text-white">Critical</Badge>
    {/if}
</div>

