<script lang="ts">
	import {page} from "$app/state";
	import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Button } from "flowbite-svelte";
	import CreateGroupModal from "$lib/components/CreateGroupModal.svelte";
	let { data } = $props();
	let formModal = $state(false);
	
</script>

<div class = "p-5">	
 		<div class="grid grid-flow-col grid-rows-2">
		<div class="row-span-2 row-start-2">
			<h1 class = "text-2xl font-bold mb-2">My Groups</h1>
		</div>
		<div class="row-span-2 row-start-2">
			<div class="flex justify-end">
				<Button onclick={() => (formModal = true)}>Create Group</Button>
				<CreateGroupModal bind:formModal> </CreateGroupModal>
			</div>
		</div>
	</div>
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