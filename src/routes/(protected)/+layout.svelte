<script lang="ts">
    import Sidebar from "$lib/components/Sidebar.svelte";
    import Navbar from "$lib/components/Navbar.svelte";
    import { themeState } from "$lib/states/theme.svelte";
	let { children, data } = $props();
    let notifcations = data.userAlerts.length !== 0 ? data.userAlerts : [];
    let sidebarOpen = $state(true);

    function toggleSidebar(){
        sidebarOpen = !sidebarOpen;
    }

    
</script>

<div class="{themeState.value} app h-screen grid grid-rows-[64px_1fr] dark:bg-[#1C1E22] bg-[#FFFFFF] {sidebarOpen ? "grid-cols-[240px_1fr]" : "grid-cols-1"}">
    <header class={sidebarOpen ? "col-span-2" : "col-span-1"}>
        <Navbar toggleSidebar={toggleSidebar} notifications={notifcations} title="Dashboard"></Navbar>
    </header>
    {#if sidebarOpen}
        <aside class="overflow-y-auto">
            <Sidebar></Sidebar>
        </aside>
    {/if}
	<main class="overflow-y-auto p-4">
		{@render children()}
	</main>
</div>

<style>
</style>
