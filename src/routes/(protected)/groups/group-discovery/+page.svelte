<script>
    import CreateGroupModal from "$lib/components/CreateGroupModal.svelte";
    import {UserOutline} from "flowbite-svelte-icons";
    import { Button, Select, Label, Search, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, PaginationNav, } from "flowbite-svelte";

    let showCreateGroupModal = $state(false);
    let { data } = $props()
    let searchTerm = $state("");
    let currentPage = $state(1);
    let pageSize = $state(10);
    let sortOrder = $state("");


    let filteredGroups = $derived(
        searchTerm.trim() === ""
        ? data.groups
        : data.groups.filter(group => 
            group.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    let sortedGroups = $derived(
        [...filteredGroups].sort((a, b) => {
        
            switch(sortOrder) {
                case "asc":
                    return a.memberCount - b.memberCount;
                case "desc":
                    return b.memberCount - a.memberCount;
                case "alphabetical":
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        })
    );

    let totalPages = $derived(Math.max(1, Math.ceil(sortedGroups.length / pageSize)));

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

    let pagedGroups = $derived(sortedGroups.slice(startPage, endPage));

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
                <Select size="md" class="w-52" placeholder="Sort by..." bind:value={sortOrder} clearable>
                    <option value="asc">Members (Low - High)</option>
                    <option value="desc">Members (High - Low)</option>
                    <option value="alphabetical">A-Z</option>
                </Select>
                <div>
                    <Search size="md" placeholder="Search for Groups" class="w-72" bind:value={searchTerm}/>
                </div>
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