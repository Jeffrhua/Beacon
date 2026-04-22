<script lang="ts">
    import { Modal, TableSearch, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Select, Button } from "flowbite-svelte"
    import SeverityBadge from "$lib/components/SeverityBadge.svelte";

    let { escalationModal = $bindable(), alerts = [] } = $props();
    let userSearchTerm = $state("");

    let selected = "";

    const severityOptions = [
        {value: "low", name: "low"},
        {value: "medium", name: "medium"},
        {value: "high", name: "high"},
        {value: "critical", name: "critical"},
    ];

    let editableAlerts = $state<any[]>([]);

    $effect(() => {
        editableAlerts = alerts.map((item) => ({
            ...item,
            originalSeverity: item.alertSeverity,
            pendingSeverity: item.alertSeverity
        }));
    });

    let userFilteredItems = $derived.by(() =>
        editableAlerts.filter(
        (item) =>
            !userSearchTerm ||
            item.alertTitle.toLowerCase().includes(userSearchTerm.toLowerCase())
        )
    );

    // Keep track of which alerts have been edited
    const changedAlerts = $derived.by(() =>
        editableAlerts
        .filter((item) => item.pendingSeverity !== item.originalSeverity)
        .map((item) => ({
            _id: item.alertId,
            alertSeverity: item.pendingSeverity
        }))
    );
    const hasChanges = $derived.by(() => changedAlerts.length > 0);

</script>

<Modal title="Escalation Edits" bind:open={escalationModal} size="lg" class="bg-gray-950!">
    <TableSearch placeholder="Search by Alert name" hoverable bind:inputValue={userSearchTerm}>
        <TableHead>
            <TableHeadCell>Created</TableHeadCell>
            <TableHeadCell>Title</TableHeadCell>
            <TableHeadCell>Description</TableHeadCell>
            <TableHeadCell>Severity</TableHeadCell>
            <TableHeadCell>Edit Severity?</TableHeadCell>
        </TableHead>
        <TableBody>
            {#if userFilteredItems.length == 0}
            <TableBodyCell colspan={4} class="text-center">No alerts found...</TableBodyCell>
            {:else}
            {#each userFilteredItems as item}
                <TableBodyRow>
                <TableBodyCell>{item?.alertCreated}</TableBodyCell>
                <TableBodyCell>{item?.alertTitle}</TableBodyCell>
                <TableBodyCell>{item?.alertDescription}</TableBodyCell>
                <TableBodyCell>
                    <SeverityBadge severity={item?.originalSeverity}/>
                </TableBodyCell>
                <TableBodyCell>
                    <Select class="mt-2" items={severityOptions} bind:value={item.pendingSeverity} />
                </TableBodyCell>
                </TableBodyRow>
            {/each}
            {/if}
        </TableBody>
    </TableSearch>

    <form method="POST" action="?/saveAlertSeverities" class="mt-4 flex justify-end">
        <input type="hidden" name="changedAlerts" value={JSON.stringify(changedAlerts)}/>

        <Button type="submit" disabled={!hasChanges}>
            Save Edits
        </Button>
    </form>
</Modal>