<script lang="ts">
	import { sidebar, Sidebar, SidebarGroup, SidebarItem  } from 'flowbite-svelte';
	import { UsersGroupSolid, HomeSolid, BellSolid, CogSolid, MapPinSolid, GlobeSolid, TruckOutline } from 'flowbite-svelte-icons';

	let sidebarOpen = true;

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}
</script>

<div class="w-full flex items-center justify-between px-4 py-3 border-b bg-gray-50">
	<button class="p-2 hover:bg-gray-200 rounded" onclick={toggleSidebar} aria-label="Toggle menu">
		☰
	</button>
	<div class ="flex items-center gap-2 w-full justify-center">
		<HomeSolid class="shrink-0 h-6 w-6" />
	<h1 class="text-lg font-semibold">
		Dashboard
	</h1>
	</div>
</div>

<div class="relative">
	{#if sidebarOpen}
	<Sidebar 
		backdrop={false} 
		params={{ x: -50, duration: 50 }} 
		class="z-50 h-full" 
		position="absolute" 
		classes={{ nonactive: 'p-2', active: 'p-2' }}
	>
		<SidebarGroup>
			<SidebarItem label="Alerts" href="/alerts">
				{#snippet icon()}
					<BellSolid class="shrink-0 h-6 w-6" />
				{/snippet}
			</SidebarItem>
			<SidebarItem label="Incidents" href="/incidents">
				{#snippet icon()}
					<MapPinSolid class="shrink-0 h-6 w-6" />
				{/snippet}
			</SidebarItem>
			<SidebarItem label="Interactive Map" href="/interactive-map">
				{#snippet icon()}
					<GlobeSolid class="shrink-0 h-6 w-6" />
				{/snippet}
			</SidebarItem>
			<SidebarItem label="Groups" href="/groups">
				{#snippet icon()}
					<UsersGroupSolid class="shrink-0 h-6 w-6" />
				{/snippet}
			</SidebarItem>
			<SidebarItem label="Settings" href="/settings">
				{#snippet icon()}
					<CogSolid class="shrink-0 h-6 w-6" />
				{/snippet}
			</SidebarItem>

		</SidebarGroup>
	</Sidebar>
	{/if}
</div>

<style>
</style>