<script>
    import CreateGroupModal from "$lib/components/CreateGroupModal.svelte";
    import {UserOutline} from "flowbite-svelte-icons";
    import { Button, Search, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, PaginationNav, } from "flowbite-svelte";

    let showCreateGroupModal = $state(false);
    let { data } = $props()
    let searchTerm = $state("");
    let currentPage = $state(1);
    let pageSize = $state(10);

    //Filter groups based on search term
    let filteredGroups = $derived(
        searchTerm.trim() === ""
        ? data.groups
        : data.groups.filter(group => 
            group.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Calculate total pages based on filtered groups
    let totalPages = $derived(Math.max(1, Math.ceil(filteredGroups.length / pageSize)));

    // Ensure current page is within valid range when filtered groups change
    $effect(() => {
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
    });
    
    //Reset to first page if the search terms changes
    $effect(() => {
        currentPage = 1;
    })

    //Calculate boundaries
    let startPage = $derived((currentPage - 1) * pageSize);
    let endPage = $derived(startPage + pageSize);

    //Get groups for the current page
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
            <Search size="md" placeholder="Search for Groups" class="max-w-md" bind:value={searchTerm}/>
        </div> 
    </div>
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <Table hoverable = {true} border={false} class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <TableHead class="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-black dark:text-gray-400">
                <TableHeadCell class="px-6 py-4">Title</TableHeadCell>
                <TableHeadCell class="px-6 py-4">Description</TableHeadCell>
                <TableHeadCell class="px-6 py-4">Members</TableHeadCell>
            </TableHead>
            <TableBody>
                {#each pagedGroups as group (group.id)}
                    <TableBodyRow>
                        <TableBodyCell class="px-6 py-4"><a class="font-medium text-gray-900 dark:text-white hover:text-blue-600 transition" title="{group.title}" href="/groups/{group.id}">{group.title}</a></TableBodyCell>
                        <TableBodyCell class="px-6 py-4">{group.description}</TableBodyCell>
                        <TableBodyCell class="px-6 py-4">
                            <div class="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <UserOutline></UserOutline>
                                <span>{group.memberCount}</span>
                            </div>
                        </TableBodyCell>
                    </TableBodyRow>
                {/each}
                {#if pagedGroups.length % 10 !== 0}
                    {#each Array(10 - (pagedGroups.length % 10)) as _}
                        <TableBodyRow>
                            <TableBodyCell class="px-6 py-4">&nbsp;</TableBodyCell>
                            <TableBodyCell class="px-6 py-4">&nbsp;</TableBodyCell>
                            <TableBodyCell class="px-6 py-4">&nbsp;</TableBodyCell>
                        </TableBodyRow>
                    {/each}
                {/if}
            </TableBody>
        </Table>
    </div>

    <div class="mt-6">
        <PaginationNav
        {currentPage}
        {totalPages}
        visiblePages={5}
        onPageChange={handlePageChange}/>
    </div>
</div>


<style>

</style>