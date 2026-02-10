<script lang="ts">
	import { TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, TableSearch } from "flowbite-svelte";
  import {page} from '$app/state';
  import SeverityBadge from "$lib/components/SeverityBadge.svelte";

	let { data } = $props();
	let items = data.userAlerts;
  	let searchTerm = $state("");

	let filteredItems = $derived.by(() =>
		items.filter(
			(item) =>
				!searchTerm ||
				item.alertTitle.toLowerCase().includes(searchTerm.toLowerCase()),
		),
	);
</script>

<div>

	<TableSearch placeholder="Search by Alert name" hoverable bind:inputValue={searchTerm}>
  <TableHead>
    <TableHeadCell>Created</TableHeadCell>
    <TableHeadCell>Title</TableHeadCell>
    <TableHeadCell>Description</TableHeadCell>
    <TableHeadCell>Group</TableHeadCell>
    <TableHeadCell>Severity</TableHeadCell>
  </TableHead>
  <TableBody>
    {#each filteredItems as item}
      <TableBodyRow>
        <TableBodyCell>{item?.alertCreated}</TableBodyCell>
        <TableBodyCell>{item?.alertTitle}</TableBodyCell>
        <TableBodyCell>{item?.alertDescription}</TableBodyCell>
        <TableBodyCell><a href="/groups/{item?.groupId}">{item?.groupName}</a></TableBodyCell>
        <TableBodyCell>
          <SeverityBadge severity={item?.alertSeverity}/>
        </TableBodyCell>
      </TableBodyRow>
    {/each}
  </TableBody>
</TableSearch>
</div>

<style>
</style>
