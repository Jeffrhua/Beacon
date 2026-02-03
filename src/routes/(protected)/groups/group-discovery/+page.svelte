<script>
    import { page } from "$app/state";;
    import { Search, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Pagination } from "flowbite-svelte";

    let { data } = $props()

    let searchTerm = $state("");

    let filteredGroups = $derived(
        searchTerm.trim() === ""
        ? data.groups
        : data.groups.filter(group => 
            group.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

</script>

<div class="p-5">
    <div class="flex justify-between items-center mb-6 gap-4">
        <h1 class="text-2xl font-bold">Group Discovery</h1>
        <Search size="md" placeholder="Search Groups" class="max-w-md" bind:value={searchTerm}/>
    </div>
    
	<Table striped = {true} hoverable = {true} color="gray" border={false}>
		<TableHead>
			<TableHeadCell>Title</TableHeadCell>
			<TableHeadCell>Description</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each filteredGroups as group (group.id)}
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