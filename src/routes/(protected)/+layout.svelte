<script lang="ts">
    import Sidebar from "$lib/components/Sidebar.svelte";
    import Navbar from "$lib/components/Navbar.svelte";
	let { children } = $props();
    let sidebarOpen = $state(true);
    function toggleSidebar(){
        sidebarOpen = !sidebarOpen;
    }

    
</script>

<div class="app h-screen grid grid-rows-[64px_1fr] {sidebarOpen ? "grid-cols-[240px_1fr]" : "grid-cols-1"}">
    <header class={sidebarOpen ? "col-span-2" : "col-span-1"}>
        <Navbar toggleSidebar={toggleSidebar} title="Dashboard"></Navbar>
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
