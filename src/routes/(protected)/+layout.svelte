<script lang="ts">
    import Sidebar from "$lib/components/Sidebar.svelte";
    import Navbar from "$lib/components/Navbar.svelte";
    import BottomNav from "$lib/components/BottomNav.svelte";
	import {browser} from "$app/environment";
    import { onMount } from "svelte";
    import { theme } from "$lib/stores/theme";
    let { children, data } = $props();
    
    let notifcations = data.userAlerts.length !== 0 ? data.userAlerts : [];
    let sidebarOpen = $state(true);
    function toggleSidebar(){
        sidebarOpen = !sidebarOpen;
    }

    
</script>

<div class="{$theme} app h-screen grid grid-rows-[64px_1fr_64px] md:grid-rows-[64px_1fr] bg-[#FFFFFF] {sidebarOpen ? "md:grid-cols-[240px_1fr]" : "md:grid-cols-1"}">
    <header class="{sidebarOpen ? "col-span-2" : "col-span-1"} z-50">
        <Navbar toggleSidebar={toggleSidebar} notifications={notifcations} title="Dashboard"></Navbar>
    </header>
    {#if sidebarOpen}
        <aside class="hidden md:block overflow-y-auto z-50">
            <Sidebar />
        </aside>
    {/if}
	<main class="overflow-y-auto dark:bg-[#1C1E22] [&::-webkit-scrollbar]:hidden [scrollbar-width:none] md:pb-0">
		{@render children()}
	</main>
    <BottomNav />
</div>


