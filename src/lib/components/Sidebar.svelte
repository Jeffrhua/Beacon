<script lang="ts">
    import { sidebar, Sidebar, SidebarGroup, SidebarItem  } from 'flowbite-svelte';
	import { UsersGroupSolid, HomeSolid, BellSolid, CogSolid, MapPinSolid, GlobeSolid, TruckOutline } from 'flowbite-svelte-icons';
</script>

<div class="relative">
    <div class="flex flex-col">
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
    </div>
   
</div>

