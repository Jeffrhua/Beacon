<script lang="ts">
	import { TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, TableSearch } from "flowbite-svelte";
  import {page} from '$app/state';
  import SeverityBadge from "$lib/components/SeverityBadge.svelte";
  import EscalateAlertModal from "$lib/components/EscalateAlertModal.svelte";

	let { data } = $props();
  let escalationModal = $state(false);
	let items = data.userAlerts;
  let searchTerm = $state("");
  let userSearchTerm = $state("");


  // function to filter items for the sear
	let filteredItems = $derived.by(() =>
		items.filter(
			(item) =>
				!searchTerm ||
				item.alertTitle.toLowerCase().includes(searchTerm.toLowerCase()),
		),
	);

  // function to filter items for the specific user
	let userFilteredItems = $derived.by(() =>
		items.filter(
			(item) =>
        item?.submittedId === data.userId &&
				(!userSearchTerm || item.alertTitle.toLowerCase().includes(userSearchTerm.toLowerCase())),
		),
	);
</script>

<div class="md:hidden p-3">
    <input 
        type="text" 
        placeholder="Search by Alert name" 
        bind:value={searchTerm}
        class="w-full px-4 py-2 rounded-lg border border-gray-600 dark:bg-gray-800 dark:text-white"
    />
</div>

<div class="md:hidden p-3">
    <input 
        type="text" 
        placeholder="Search by Alert name" 
        bind:value={userSearchTerm}
        class="w-full px-4 py-2 rounded-lg border border-gray-600 dark:bg-gray-800 dark:text-white"
    />
</div>


<div class="mobile-cards md:hidden flex flex-col gap-3 px-3 pb-20">
    {#each filteredItems as item}
    <div class="rounded-lg p-4" style="background-color: #1f1f1f; border: 1px solid #3a1a1a;">
        <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-white">{item?.alertTitle}</span>
            <SeverityBadge severity={item?.alertSeverity} />
        </div>
        <p class="text-sm text-gray-400 mb-2">{item?.alertDescription}</p>
        <div class="flex items-center justify-between text-xs text-gray-500">
            <a href="/groups/{item?.groupId}" style="color: #e84040 !important;">{item?.groupName}</a>
            <span>{item?.alertCreated}</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">By: {item?.submittedBy ?? "Unknown"}</p>
    </div>
    {/each}
</div>

<div class="desktop-table overflow-x-auto w-full">
  <h2 class="text-3xl font-bold mt-4 pl-4">
    All Alerts
  </h2>
  <!-- Create a Table with information about every alert -->
	<TableSearch placeholder="Search by Alert name" hoverable bind:inputValue={searchTerm}>
  <TableHead>
    <TableHeadCell>Created</TableHeadCell>
    <TableHeadCell>Title</TableHeadCell>
    <TableHeadCell>Description</TableHeadCell>
    <TableHeadCell>Group</TableHeadCell>
    <TableHeadCell>Severity</TableHeadCell>
    <TableHeadCell>Submitted By</TableHeadCell>
  </TableHead>
  <TableBody>
    {#if filteredItems.length == 0}
    <TableBodyCell colspan={6} class="text-center">No alerts found...</TableBodyCell>
    {:else}
      {#each filteredItems as item}
        <TableBodyRow>
          <TableBodyCell>{item?.alertCreated}</TableBodyCell>
          <TableBodyCell>{item?.alertTitle}</TableBodyCell>
          <TableBodyCell>{item?.alertDescription}</TableBodyCell>
          <TableBodyCell><a href="/groups/{item?.groupId}">{item?.groupName}</a></TableBodyCell>
          <TableBodyCell>
            <SeverityBadge severity={item?.alertSeverity}/>
          </TableBodyCell>
          <TableBodyCell>{item?.submittedBy ?? "Unknown"}</TableBodyCell>
        </TableBodyRow>
      {/each}
    {/if}
  </TableBody>
</TableSearch>
</div>

<hr class="border-t mt-8">

<div class="desktop-table overflow-x-auto w-full">
  <div class="flex justify-between">
    <h2 class="text-3xl font-bold mt-4 pl-4">
      My Alerts
    </h2>
    <button onclick={() => (escalationModal = true)} class="text-white mt-4 mr-4 rounded">
        Escalate Alert
    </button>
    <EscalateAlertModal
      bind:escalationModal
      alerts = {userFilteredItems}
    ></EscalateAlertModal>
  </div>
  <!-- Create a Table with information about every alert -->
	<TableSearch placeholder="Search by Alert name" hoverable bind:inputValue={userSearchTerm}>
  <TableHead>
    <TableHeadCell>Created</TableHeadCell>
    <TableHeadCell>Title</TableHeadCell>
    <TableHeadCell>Description</TableHeadCell>
    <TableHeadCell>Group</TableHeadCell>
    <TableHeadCell>Severity</TableHeadCell>
    <TableHeadCell>Submitted By</TableHeadCell>
  </TableHead>
  <TableBody>
    {#if userFilteredItems.length == 0}
    <TableBodyCell colspan={6} class="text-center">No alerts found...</TableBodyCell>
    {:else}
      {#each userFilteredItems as item}
        <TableBodyRow>
          <TableBodyCell>{item?.alertCreated}</TableBodyCell>
          <TableBodyCell>{item?.alertTitle}</TableBodyCell>
          <TableBodyCell>{item?.alertDescription}</TableBodyCell>
          <TableBodyCell><a href="/groups/{item?.groupId}">{item?.groupName}</a></TableBodyCell>
          <TableBodyCell>
            <SeverityBadge severity={item?.alertSeverity}/>
          </TableBodyCell>
          <TableBodyCell>{item?.submittedBy ?? "Unknown"}</TableBodyCell>
        </TableBodyRow>
      {/each}
    {/if}
  </TableBody>
</TableSearch>
</div>

<style>
    @media (max-width: 768px) {
    .desktop-table {
      display: none !important;
    }
  }
  @media (min-width: 769px) {
    .mobile-cards {
      display: none !important;
    }
  }
</style>
