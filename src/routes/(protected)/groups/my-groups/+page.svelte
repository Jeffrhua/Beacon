<script lang="ts">
	import {page} from "$app/state";
	import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Checkbox, TableSearch } from "flowbite-svelte";
	let { data } = $props();
	
</script>

<div class = "p-5">	
	<a href="/dashboard">Dashboard</a>
	<h1 class = "text-2xl font-bold mb-2">My Groups</h1>
	<Table striped = {true} hoverable = {true} color="gray" border={false}>
		<TableHead>
			<TableHeadCell>Title</TableHeadCell>
			<TableHeadCell>Description</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each data.groups as group (group.id)}
				<TableBodyRow>
					<TableBodyCell><a class="text-[#a1bfff]" title="{group.title}" href="/groups/{group.id}">{group.title}</a></TableBodyCell>
					<TableBodyCell>{group.description}</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</div>

<style>
</style>