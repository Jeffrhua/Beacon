<script lang="ts">
    import Sidebar from "$lib/components/Sidebar.svelte";
    import Navbar from "$lib/components/Navbar.svelte";
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

<div class="{$theme} app h-screen grid grid-rows-[64px_1fr] bg-[#FFFFFF] {sidebarOpen ? "grid-cols-[240px_1fr]" : "grid-cols-1"}">
    <header class="{sidebarOpen ? "col-span-2" : "col-span-1"} z-50">
        <Navbar toggleSidebar={toggleSidebar} notifications={notifcations} title="Dashboard"></Navbar>
    </header>
    {#if sidebarOpen}
        <aside class="overflow-y-auto z-50">
            <Sidebar></Sidebar>
        </aside>
    {/if}
	<main class="overflow-y-auto p-4 ">
		{@render children()}
	</main>
</div>


