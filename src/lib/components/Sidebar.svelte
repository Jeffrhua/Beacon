<script lang="ts">
    import { sidebar, Sidebar, SidebarGroup, SidebarItem, SidebarButton, uiHelpers  } from 'flowbite-svelte';
	import { UsersGroupSolid, HomeSolid, BellSolid, CogSolid, MapPinSolid, GlobeSolid, TruckOutline } from 'flowbite-svelte-icons';
	import { page } from "$app/state";
	let activeUrl = $state(page.url.pathname);
	const spanClass = "flex-1 ms-3 whitespace-nowrap";
	const demoSidebarUi = uiHelpers();
	let isDemoOpen = $state(false);
	$effect(() => {
		isDemoOpen = demoSidebarUi.isOpen;
		activeUrl = page.url.pathname;
	});
</script>
<div class="beacon-sidebar h-full">
	<Sidebar
		{activeUrl}
		backdrop={false}
		position="absolute"
		class="relative z-50 px-0! h-full !bg-[#17191C] dark:!bg-[#17191C]"
		classes={{
			nonactive: "flex items-center p-2 text-white hover:bg-[#222326]",
			active: "flex items-center p-2 text-white bg-[#222326]"
		}}
		>
		<SidebarGroup class=" w-full h-full !bg-[#17191C] dark:!bg-[#17191C]">
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
   

<style>
  :global(.beacon-sidebar .px-3.py-4) {
    padding: 0 !important;
  }
</style>