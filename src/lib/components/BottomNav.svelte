<script lang="ts">
    import { BottomNav, BottomNavItem } from 'flowbite-svelte';
    import { HomeSolid, BellSolid, UsersGroupSolid, GlobeSolid, CogSolid, MapPinSolid, MessagesSolid, UsersSolid, ShareNodesSolid } from 'flowbite-svelte-icons';
    import { page } from "$app/state";
    let activeUrl = $derived(page.url.pathname);
    let moreOpen = $state(false);
</script>

<div class="bottom-nav-wrapper md:hidden">
    {#if moreOpen}
    <div class="fixed bottom-16 left-0 right-0 z-[2000]" style="background-color: #17191C; border-top: 1px solid #2a0a0a;">
        <a href="/incidents" onclick={() => moreOpen = false} class="flex items-center gap-3 px-4 py-3" style="color: white !important;">
            <MapPinSolid class="shrink-0 h-6 w-6" /> <span>Incidents</span>
        </a>
        <a href="/messages" onclick={() => moreOpen = false} class="flex items-center gap-3 px-4 py-3" style="color: white !important;">
            <MessagesSolid class="shrink-0 h-6 w-6" /> <span>Messages</span>
        </a>
        <a href="/friends" onclick={() => moreOpen = false} class="flex items-center gap-3 px-4 py-3" style="color: white !important;">
            <UsersSolid class="shrink-0 h-6 w-6" /> <span>Friends</span>
        </a>
        <a href="/location-sharing" onclick={() => moreOpen = false} class="flex items-center gap-3 px-4 py-3" style="color: white !important;">
            <ShareNodesSolid class="shrink-0 h-6 w-6" /> <span>Location Sharing</span>
        </a>
        <a href="/settings" onclick={() => moreOpen = false} class="flex items-center gap-3 px-4 py-3" style="color: white !important;">
            <CogSolid class="shrink-0 h-6 w-6" /> <span>Settings</span>
        </a>
    </div>
    {/if}

    <BottomNav position="fixed" classes={{ inner: "grid-cols-5" }} activeUrl={activeUrl}>
        <BottomNavItem btnName="Home" href="/dashboard">
            <HomeSolid class="group-hover:text-primary-600 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400" />
        </BottomNavItem>
        <BottomNavItem btnName="Alerts" href="/alerts">
            <BellSolid class="group-hover:text-primary-600 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400" />
        </BottomNavItem>
        <BottomNavItem btnName="Groups" href="/groups">
            <UsersGroupSolid class="group-hover:text-primary-600 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400" />
        </BottomNavItem>
        <BottomNavItem btnName="Map" href="/interactive-map">
            <GlobeSolid class="group-hover:text-primary-600 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400" />
        </BottomNavItem>
        <BottomNavItem btnName="More" href="#" onclick={() => moreOpen = !moreOpen}>
            <svg class="mb-1 h-6 w-6 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
        </BottomNavItem>
    </BottomNav>
</div>

<style>
  :global(div.md\:hidden nav button) {
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    transform: none !important;
    text-transform: none !important;
    color: rgb(107 114 128) !important;
  }
    @media (min-width: 768px) {
    .bottom-nav-wrapper {
      display: none !important;
    }
  }
    .bottom-nav-wrapper {
    height: 0 !important;
    overflow: visible !important;
  }
</style>