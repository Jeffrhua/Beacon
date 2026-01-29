<script lang="ts">
    import Sidebar from "$lib/components/Sidebar.svelte";
    import Navbar from "$lib/components/Navbar.svelte";
	let { children } = $props();
    let sidebarOpen = $state(true);
    function toggleSidebar(){
        sidebarOpen = !sidebarOpen;
    }

    
</script>

<div class="app">
    <Navbar toggleSidebar={toggleSidebar} title="Dashboard"></Navbar>
    <Sidebar sidebarOpen={sidebarOpen}></Sidebar>
	<main>
		<slot></slot>
	</main>
</div>

<style>
</style>
