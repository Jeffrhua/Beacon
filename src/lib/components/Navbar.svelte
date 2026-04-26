<script lang="ts">
    import { page } from "$app/state";
	import { HomeSolid, BellSolid } from 'flowbite-svelte-icons';
    import { Button, Dropdown, DropdownItem, ListgroupItem } from "flowbite-svelte";
    import { Card, Listgroup, Avatar } from "flowbite-svelte";
    import SeverityBadge from "$lib/components/SeverityBadge.svelte";

    let { toggleSidebar, title, notifications = [], seenIds = [] } = $props();
    let activeUrl = $derived(page.url.pathname);

    // Which alerts are unread
   let seenSet = $derived(new Set<string>(seenIds));
    let unreadCount = $derived(
        notifications.filter((n: any) => !seenSet.has(n.alertId)).length
    );

    async function onBellClick() {
        // Get IDs of all currently unread alerts
        const unreadIds = notifications
            .filter((n: any) => !seenSet.has(n.alertId))
            .map((n: any) => n.alertId)
            .filter(Boolean);

        if (unreadIds.length === 0) return;

        // Save to MongoDB
        await fetch('/alerts/seen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alertIds: unreadIds })
        });

        // Update locally so badge disappears instantly
        seenSet = new Set([...seenSet, ...unreadIds]);
    }
</script>

<div class="w-full h-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#23272F]">
    <button class="md:flex hidden p-2 hover:bg-gray-200 rounded" onclick={toggleSidebar} aria-label="Toggle menu">
		☰
	</button>
    <div class ="flex items-center gap-2 w-full justify-center">
        <HomeSolid class="shrink-0 h-6 w-6 dark:text-gray-50 text-black" />
        <h1 class="text-lg font-semibold dark:text-gray-50 text-black">
            {title}
        </h1>
    </div>
    <div class="px-10">
        <Button outline color="dark" class="relative" onclick={onBellClick}>
            <BellSolid class="shrink-0 h-7 w-7 cursor-pointer dark:text-white"/>
            {#if unreadCount > 0}
                <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            {/if}
        </Button>
        <Dropdown activeUrl={activeUrl}>
            <Listgroup items={notifications} class="border-0 w-[300px] h-[500px] overflow-y-auto">
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
                                <SeverityBadge severity={item?.alertSeverity}></SeverityBadge>
                            </div>
                        </div>
                    </ListgroupItem>
                {/snippet}
            </Listgroup>
        </Dropdown>
    </div>
</div>