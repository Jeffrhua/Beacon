<script lang="ts">
    import { Button, Modal} from "flowbite-svelte";
    let {exportModal = $bindable(), exportPDF, exportJSON} = $props()
</script>

<Modal bind:open={exportModal} title="Export Report" size="sm">
    <Button onclick={exportPDF} class="text-[12px]">Export Alerts as PDF</Button>
    <Button onclick={exportJSON} class="text-[12px]">Export Alerts as JSON</Button>

</Modal>


