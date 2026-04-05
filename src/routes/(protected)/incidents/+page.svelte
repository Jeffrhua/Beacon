<script lang="ts">
    import { enhance } from "$app/forms";
    import {
        Table, TableBody, TableBodyCell, TableBodyRow,
        TableHead, TableHeadCell, Input
    } from "flowbite-svelte";

    let { data } = $props();
    let search         = $state("");
    let filterStatus   = $state("all");
    let filterDate     = $state("all");
    let filterSeverity = $state("all");
    let resolvedOpen   = $state(false);
    let modalPhoto: string | null = $state(null); // NEW

    const statusOptions = ["active", "investigating", "resolved"];

    const dateOptions = [
        { value: "all",   name: "All Time" },
        { value: "today", name: "Today" },
        { value: "week",  name: "This Week" },
        { value: "month", name: "This Month" }
    ];

    const statusFilterOptions = [
        { value: "all",           name: "All Statuses" },
        { value: "active",        name: "Active" },
        { value: "investigating", name: "Investigating" }
    ];

    const severityFilterOptions = [
        { value: "all",      name: "All Severities" },
        { value: "low",      name: "Low" },
        { value: "moderate", name: "Moderate" },
        { value: "high",     name: "High" }
    ];

    function isWithinDateRange(isoDate: string, range: string): boolean {
        if (range === "all") return true;
        const date = new Date(isoDate);
        const now  = new Date();
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

    let activeFiltered = $derived(
        data.incidents.filter((i: any) => {
            if ((i.status ?? "active") === "resolved") return false;
            const matchesSearch =
                i.description?.toLowerCase().includes(search.toLowerCase()) ||
                i.address?.toLowerCase().includes(search.toLowerCase()) ||
                i.groupName?.toLowerCase().includes(search.toLowerCase());
            const matchesStatus   = filterStatus === "all" || (i.status ?? "active") === filterStatus;
            const matchesDate     = isWithinDateRange(i.createdAt, filterDate);
            const matchesSeverity = filterSeverity === "all" || (i.severity ?? "low") === filterSeverity;
            return matchesSearch && matchesStatus && matchesDate && matchesSeverity;
        })
    );

    let resolvedFiltered = $derived(
        data.incidents.filter((i: any) => {
            if ((i.status ?? "active") !== "resolved") return false;
            return (
                i.description?.toLowerCase().includes(search.toLowerCase()) ||
                i.address?.toLowerCase().includes(search.toLowerCase()) ||
                i.groupName?.toLowerCase().includes(search.toLowerCase())
            );
        })
    );

    function formatDate(iso: string) {
        if (!iso) return "—";
        return new Date(iso).toLocaleString();
    }

    function getStatusColor(status: string): string {
        switch (status) {
            case "active":        return "#dc2626";
            case "investigating": return "#ca8a04";
            case "resolved":      return "#16a34a";
            default:              return "#dc2626";
        }
    }

    function getSeverityColor(severity: string): string {
        switch (severity) {
            case "low":      return "#16a34a";
            case "moderate": return "#ca8a04";
            case "high":     return "#dc2626";
            default:         return "#6b7280";
        }
    }

    const totalIncidents = $derived(data.incidents.length);
</script>

<div class="p-5">

    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 class="text-2xl font-bold text-[#e03030]">Incidents</h1>
        <Input placeholder="Search incidents..." bind:value={search} class="w-full md:w-72" />
    </div>

    <div class="flex gap-4 mb-4 flex-wrap">

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

        <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-400">Severity</label>
            <select
                bind:value={filterSeverity}
                class="border border-gray-600 rounded px-3 py-2 text-sm text-white appearance-none w-44"
                style="background-color: #1f2937; padding-right: 2rem;"
            >
                {#each severityFilterOptions as opt}
                    <option value={opt.value} class="bg-gray-800 text-white">{opt.name}</option>
                {/each}
            </select>
        </div>

        <div class="flex items-end">
            <button
                onclick={() => { filterStatus = "all"; filterDate = "all"; filterSeverity = "all"; search = ""; }}
                class="px-3 py-2 text-sm text-gray-400 border border-gray-600 rounded hover:text-white hover:border-white transition"
            >
                Clear Filters
            </button>
        </div>

    </div>

    <!-- ACTIVE INCIDENTS TABLE -->
    <Table striped={true} hoverable={true} color="gray" border={false}>
        <TableHead>
            <TableHeadCell>Created</TableHeadCell>
            <TableHeadCell>Description</TableHeadCell>
            <TableHeadCell>Address</TableHeadCell>
            <TableHeadCell>Group</TableHeadCell>
            <TableHeadCell>Severity</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Photo</TableHeadCell>
        </TableHead>
        <TableBody>
            {#each activeFiltered as incident (incident.id)}
                <TableBodyRow>

                    <TableBodyCell>{formatDate(incident.createdAt)}</TableBodyCell>

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

                    <TableBodyCell>
                        <span class="px-2 py-1 rounded text-sm font-semibold text-white bg-blue-600">
                            {incident.groupName ?? "No Group"}
                        </span>
                    </TableBodyCell>

                    <TableBodyCell>
                        <span
                            class="px-2 py-1 rounded text-sm font-semibold text-white"
                            style="background-color: {getSeverityColor(incident.severity ?? 'low')};"
                        >
                            {(incident.severity ?? 'low').charAt(0).toUpperCase() + (incident.severity ?? 'low').slice(1)}
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
                                        <option value={opt} selected={incident.status === opt} class="bg-gray-800 text-white font-normal">
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

                    <TableBodyCell>
                        {#if incident.photo}
                            <button onclick={() => modalPhoto = incident.photo} style="background: none; border: none; padding: 0; cursor: pointer;">
                                <img
                                    src={incident.photo}
                                    alt="Incident"
                                    style="height: 48px; width: 64px; object-fit: cover; border-radius: 4px;"
                                    title="Click to view full image"
                                />
                            </button>
                        {:else}
                            <span class="text-gray-500 text-xs">—</span>
                        {/if}
                    </TableBodyCell>

                </TableBodyRow>
            {/each}

            {#if activeFiltered.length === 0}
                <TableBodyRow>
                    <TableBodyCell colspan={7} class="text-center text-gray-500 py-6">
                        No active incidents match your filters.
                    </TableBodyCell>
                </TableBodyRow>
            {/if}
        </TableBody>
    </Table>

    <p class="text-sm text-gray-500 mt-3 mb-8">
        Showing {activeFiltered.length} active incident{activeFiltered.length !== 1 ? 's' : ''}
    </p>

    <!-- RESOLVED FOLDER -->
    <button
        onclick={() => resolvedOpen = !resolvedOpen}
        class="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-green-700 text-green-400 hover:bg-green-900/20 transition mb-1"
        style="background-color: #052e16;"
    >
        <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
            </svg>
            <span class="font-semibold text-sm">Resolved Incidents</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-green-700 text-white">
                {resolvedFiltered.length}
            </span>
        </div>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 transition-transform duration-200"
            style="transform: rotate({resolvedOpen ? 180 : 0}deg)"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
        >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    </button>

    {#if resolvedOpen}
        <div class="border border-green-800 rounded-b-lg overflow-hidden mb-4">
            <Table striped={true} hoverable={true} color="gray" border={false}>
                <TableHead>
                    <TableHeadCell>Resolved At</TableHeadCell>
                    <TableHeadCell>Description</TableHeadCell>
                    <TableHeadCell>Address</TableHeadCell>
                    <TableHeadCell>Group</TableHeadCell>
                    <TableHeadCell>Severity</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell>
                    <TableHeadCell>Photo</TableHeadCell>
                </TableHead>
                <TableBody>
                    {#each resolvedFiltered as incident (incident.id)}
                        <TableBodyRow>

                            <TableBodyCell class="opacity-70">{formatDate(incident.createdAt)}</TableBodyCell>

                            <TableBodyCell>
                                <span title={incident.description} class="block max-w-[200px] truncate opacity-70">
                                    {incident.description}
                                </span>
                            </TableBodyCell>

                            <TableBodyCell>
                                <span title={incident.address} class="block max-w-[500px] whitespace-normal break-words opacity-70">
                                    {incident.address}
                                </span>
                            </TableBodyCell>

                            <TableBodyCell>
                                <span class="px-2 py-1 rounded text-sm font-semibold text-white bg-blue-600 opacity-70">
                                    {incident.groupName ?? "No Group"}
                                </span>
                            </TableBodyCell>

                            <TableBodyCell>
                                <span
                                    class="px-2 py-1 rounded text-sm font-semibold text-white opacity-70"
                                    style="background-color: {getSeverityColor(incident.severity ?? 'low')};"
                                >
                                    {(incident.severity ?? 'low').charAt(0).toUpperCase() + (incident.severity ?? 'low').slice(1)}
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
                                                <option value={opt} selected={incident.status === opt} class="bg-gray-800 text-white font-normal">
                                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                                </option>
                                            {/each}
                                        </select>
                                    </form>
                                {:else}
                                    <span class="px-2 py-1 rounded text-sm font-semibold text-white bg-green-700">
                                        Resolved
                                    </span>
                                {/if}
                            </TableBodyCell>

                            <TableBodyCell>
                                {#if incident.photo}
                                    <button onclick={() => modalPhoto = incident.photo} style="background: none; border: none; padding: 0; cursor: pointer;">
                                        <img
                                            src={incident.photo}
                                            alt="Incident"
                                            style="height: 48px; width: 64px; object-fit: cover; border-radius: 4px; opacity: 0.7;"
                                            title="Click to view full image"
                                        />
                                    </button>
                                {:else}
                                    <span class="text-gray-500 text-xs">—</span>
                                {/if}
                            </TableBodyCell>

                        </TableBodyRow>
                    {/each}

                    {#if resolvedFiltered.length === 0}
                        <TableBodyRow>
                            <TableBodyCell colspan={7} class="text-center text-gray-500 py-6">
                                No resolved incidents yet.
                            </TableBodyCell>
                        </TableBodyRow>
                    {/if}
                </TableBody>
            </Table>
        </div>
    {/if}

    <p class="text-sm text-gray-500 mt-2">
        {totalIncidents} total incident{totalIncidents !== 1 ? 's' : ''} ({resolvedFiltered.length} resolved)
    </p>

</div>

<!-- PHOTO MODAL -->
{#if modalPhoto}
    <div
        onclick={() => modalPhoto = null}
        style="
            position: fixed; inset: 0; z-index: 9999;
            background: rgba(0,0,0,0.85);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
        "
    >
        <img
            src={modalPhoto}
            alt="Incident full view"
            style="max-width: 90vw; max-height: 90vh; border-radius: 8px; object-fit: contain;"
            onclick={(e) => e.stopPropagation()}
        />
        <button
            onclick={() => modalPhoto = null}
            style="
                position: absolute; top: 20px; right: 28px;
                background: none; border: none;
                color: white; font-size: 2rem; cursor: pointer;
            "
        >✕</button>
    </div>
{/if}


