<script lang="ts">
    import { enhance } from "$app/forms";
    import {
        Table, TableBody, TableBodyCell, TableBodyRow,
        TableHead, TableHeadCell, Input
    } from "flowbite-svelte";

    let { data } = $props();
    let search = $state("");
    let filterStatus = $state("all");
    let filterDate = $state("all");

    const statusOptions = ["active", "investigating", "resolved"];

    const dateOptions = [
        { value: "all", name: "All Time" },
        { value: "today", name: "Today" },
        { value: "week", name: "This Week" },
        { value: "month", name: "This Month" }
    ];

    const statusFilterOptions = [
        { value: "all", name: "All Statuses" },
        { value: "active", name: "Active" },
        { value: "investigating", name: "Investigating" },
        { value: "resolved", name: "Resolved" }
    ];

    function isWithinDateRange(isoDate: string, range: string): boolean {
        if (range === "all") return true;
        const date = new Date(isoDate);
        const now = new Date();
        if (range === "today") return date.toDateString() === now.toDateString();
        if (range === "week") {
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return date >= weekAgo;
        }
        if (range === "month") {
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            return date >= monthAgo;
        }
        return true;
    }

    let filtered = $derived(
        data.incidents.filter((i: any) => {
            const matchesSearch =
                i.description?.toLowerCase().includes(search.toLowerCase()) ||
                i.address?.toLowerCase().includes(search.toLowerCase()) ||
                i.groupName?.toLowerCase().includes(search.toLowerCase());
            const matchesStatus =
                filterStatus === "all" || (i.status ?? "active") === filterStatus;
            const matchesDate = isWithinDateRange(i.createdAt, filterDate);
            return matchesSearch && matchesStatus && matchesDate;
        })
    );

    function formatDate(iso: string) {
        if (!iso) return "—";
        return new Date(iso).toLocaleString();
    }

    function getStatusColor(status: string): string {
        switch (status) {
            case "active": return "#dc2626";
            case "investigating": return "#ca8a04";
            case "resolved": return "#16a34a";
            default: return "#dc2626";
        }
    }
</script>

<div class="p-5">

    <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-[#e03030]">Incidents</h1>
        <Input placeholder="Search incidents..." bind:value={search} class="w-72" />
    </div>

    <div class="flex gap-4 mb-4">
        <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-400">Status</label>
            <select
                bind:value={filterStatus}
                class="border border-gray-600 rounded px-3 py-2 text-sm text-white appearance-none w-44"
                style="background-color: #1f2937; padding-right: 2rem;"
            >
                {#each statusFilterOptions as opt}
                    <option value={opt.value} class="bg-gray-800 text-white">{opt.name}</option>
                {/each}
            </select>
        </div>
        <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-400">Date Range</label>
            <select
                bind:value={filterDate}
                class="border border-gray-600 rounded px-3 py-2 text-sm text-white appearance-none w-44"
                style="background-color: #1f2937; padding-right: 2rem;"
            >
                {#each dateOptions as opt}
                    <option value={opt.value} class="bg-gray-800 text-white">{opt.name}</option>
                {/each}
            </select>
        </div>
        <div class="flex items-end">
            <button
                onclick={() => { filterStatus = "all"; filterDate = "all"; search = ""; }}
                class="px-3 py-2 text-sm text-gray-400 border border-gray-600 rounded hover:text-white hover:border-white transition"
            >
                Clear Filters
            </button>
        </div>
    </div>

    <Table striped={true} hoverable={true} color="gray" border={false}>
        <TableHead>
            <TableHeadCell>Created</TableHeadCell>
            <TableHeadCell>Description</TableHeadCell>
            <TableHeadCell>Address</TableHeadCell>
            <TableHeadCell>Group</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
        </TableHead>
        <TableBody>
            {#each filtered as incident (incident.id)}
                <TableBodyRow>

                    <TableBodyCell>
                        {formatDate(incident.createdAt)}
                    </TableBodyCell>

                    <TableBodyCell>
                        <span title={incident.description} class="block max-w-[200px] truncate">
                            {incident.description}
                        </span>
                    </TableBodyCell>

                    <TableBodyCell>
                        <span title={incident.address} class="block max-w-[500px] whitespace-normal break-words">
                            {incident.address}
                        </span>
                    </TableBodyCell>

                    <!-- NEW GROUP COLUMN -->
                    <TableBodyCell>
                        <span class="px-2 py-1 rounded text-sm font-semibold text-white bg-blue-600">
                            {incident.groupName ?? "No Group"}
                        </span>
                    </TableBodyCell>

                    <TableBodyCell>
                        {#if incident.isAdminControlled}
                            <form method="POST" action="?/updateStatus" use:enhance>
                                <input type="hidden" name="id" value={incident.id} />
                                <select
                                    name="status"
                                    class="border border-gray-500 rounded px-2 py-1 text-sm font-semibold text-white appearance-none w-36"
                                    style="background-color: {getStatusColor(incident.status ?? 'active')}; padding-right: 2rem;"
                                    onchange={(e) => (e.currentTarget as HTMLSelectElement).form?.requestSubmit()}
                                >
                                    {#each statusOptions as opt}
                                        <option
                                            value={opt}
                                            selected={incident.status === opt}
                                            class="bg-gray-800 text-white font-normal"
                                        >
                                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                        </option>
                                    {/each}
                                </select>
                            </form>
                        {:else}
                            <span
                                class="px-2 py-1 rounded text-sm font-semibold text-white"
                                style="background-color: {getStatusColor(incident.status ?? 'active')};"
                            >
                                {(incident.status ?? 'active').charAt(0).toUpperCase() + (incident.status ?? 'active').slice(1)}
                            </span>
                        {/if}
                    </TableBodyCell>

                </TableBodyRow>
            {/each}

            {#if filtered.length === 0}
                <TableBodyRow>
                    <TableBodyCell colspan={5} class="text-center text-gray-500 py-6">
                        No incidents match your filters.
                    </TableBodyCell>
                </TableBodyRow>
            {/if}
        </TableBody>
    </Table>

    <p class="text-sm text-gray-500 mt-3">
        Showing {filtered.length} of {data.incidents.length} incidents
    </p>

</div>