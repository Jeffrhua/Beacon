<script lang="ts">
    import { page } from "$app/state";
	import { HomeSolid, BellSolid } from 'flowbite-svelte-icons';
    import { Button, Dropdown, DropdownItem, ListgroupItem } from "flowbite-svelte";
    import { Card, Listgroup, Avatar } from "flowbite-svelte";
    import SeverityBadge from "$lib/components/SeverityBadge.svelte";
    let {toggleSidebar, title, notifications = []} = $props();
    let activeUrl = $derived(page.url.pathname);
</script>

<div class="w-full flex items-center justify-between px-4 py-3 border-b bg-gray-50">
    <button class="p-2 hover:bg-gray-200 rounded" onclick={toggleSidebar} aria-label="Toggle menu">
		☰
	</button>
    <div class ="flex items-center gap-2 w-full justify-center">
        <HomeSolid class="shrink-0 h-6 w-6" />
        <h1 class="text-lg font-semibold">
            {title}
        </h1>
    </div>
    <div class="px-10">
        <Button outline color="dark"><BellSolid class="shrink-0 h-7 w-7 cursor-pointer dark:text-white"/></Button>
        <Dropdown activeUrl={activeUrl}>
            <Listgroup items={notifications} class="border-0 dark:bg-transparent! w-[300px]">
                {#snippet children(item)}
                    <ListgroupItem href="/groups/{item.groupId}">
                        <div class="min-w-full w-full flex items-center space-x-4 py-2 rtl:space-x-reverse">
                            <div class="min-w-0 max-w-[260px]">
                                <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                                    {item.groupName}
                                </p>
                                <p class="truncate text-sm font-small text-gray-900 dark:text-white">
                                    {item.alertTitle}
                                </p>
                                <p class="truncate text-sm text-gray-500 dark:text-gray-400">
                                    {item.alertCreated}
                                </p>
                            </div>

                            <div class="ml-auto shrink-0 text-base font-semibold text-gray-900 dark:text-white">
                                <SeverityBadge severity={item.alertSeverity}></SeverityBadge>
                            </div>
                        </div>
                    </ListgroupItem>
                {/snippet}
            </Listgroup>
        </Dropdown>
    </div>
</div>
