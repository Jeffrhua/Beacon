<script lang="ts">
    import { page } from "$app/state";
	import { HomeSolid, BellSolid } from 'flowbite-svelte-icons';
    import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
    import { Card, Listgroup, Avatar } from "flowbite-svelte";
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
        <Button outline color="dark"><BellSolid class="shrink-0 h-7 w-7 cursor-pointer dark:text-white hover:text-gray-700"/></Button>
        <Dropdown activeUrl={activeUrl}>
            <Listgroup items={notifications} class="border-0 dark:bg-transparent!">
                {#snippet children(item)}
                <div class="flex items-center space-x-4 py-2 rtl:space-x-reverse">
                    <DropdownItem>{item.title}</DropdownItem>
                </div>
                {/snippet}
            </Listgroup>
        </Dropdown>
    </div>
</div>
