<script>
    import CreateGroupModal from "$lib/components/CreateGroupModal.svelte";
    import { Button, Search, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, PaginationNav, } from "flowbite-svelte";

    let showCreateGroupModal = $state(false);

    let { data } = $props()

    let searchTerm = $state("");

    let currentPage = $state(1);
    let pageSize = $state(10);

    let filteredGroups = $derived(
        searchTerm.trim() === ""
        ? data.groups
        : data.groups.filter(group => 
            group.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    let totalPages = $derived(Math.max(1, Math.ceil(filteredGroups.length / pageSize)));

    $effect(() => {
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
    });
    
    $effect(() => {
        currentPage = 1;
    })

    let startPage = $derived((currentPage - 1) * pageSize);
    let endPage = $derived(startPage + pageSize);

    let pagedGroups = $derived(filteredGroups.slice(startPage, endPage));

    function handlePageChange(newPage) {
        currentPage = newPage;
    }

</script>

<div class="p-5">
    <div class="flex justify-between items-center mb-6 gap-4">
        <h1 class="text-2xl font-bold">Group Discovery</h1>
        <div class ="flex items-center gap-3">
            <span class="flex-none">
                <Button onclick={() => showCreateGroupModal = true}>Create Group</Button>
                <CreateGroupModal bind:formModal={showCreateGroupModal}/>
            </span>
            <Search size="md" placeholder="Search Groups" class="max-w-md" bind:value={searchTerm}/>
        </div> 
    </div>
    
	<Table striped = {true} hoverable = {true} color="gray" border={false}>
		<TableHead>
			<TableHeadCell>Title</TableHeadCell>
			<TableHeadCell>Description</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each pagedGroups as group (group.id)}
				<TableBodyRow>
					<TableBodyCell><a class="text-[#a1bfff]" title="{group.title}" href="/groups/{group.id}">{group.title}</a></TableBodyCell>
					<TableBodyCell>{group.description}</TableBodyCell>
				</TableBodyRow>
			{/each}
            {#if pagedGroups.length % 10 !== 0}
                {#each Array(10 - (pagedGroups.length % 10)) as _}
                    <TableBodyRow>
                        <TableBodyCell>&nbsp;</TableBodyCell>
                        <TableBodyCell>&nbsp;</TableBodyCell>
                    </TableBodyRow>
                {/each}
            {/if}
		</TableBody>
	</Table>


    <PaginationNav
    {currentPage}
    {totalPages}
    visiblePages={5}
    onPageChange={handlePageChange}/>
</div>


<style>

</style>