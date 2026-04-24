<script lang="ts">
    import Sidebar from "$lib/components/Sidebar.svelte";
    import Navbar from "$lib/components/Navbar.svelte";
    import BottomNav from "$lib/components/BottomNav.svelte";
    import { onMount, untrack } from "svelte";
    import { theme } from "$lib/stores/theme";
    import { invalidate } from "$app/navigation";
    import { browser } from "$app/environment";

    let { children, data } = $props();
    
    let notifications = $state(data.userAlerts ?? []);
    let sidebarOpen = $state(true);

    function toggleSidebar(){
        sidebarOpen = !sidebarOpen;
    }
    
    // Get the current user's notification setting
    function getNotificationMode(): "Do Not Disturb" | "Silent" | "Allow All" {
        if (!browser) return "Do Not Disturb";

        const saved = localStorage.getItem("notificationMode");
        if (saved === "Do Not Disturb" ||
            saved === "Silent" ||
            saved === "Allow All") { return saved; }

        return "Do Not Disturb";
    }

    // Actually deliver the browser notif
    function showBrowserNotification(alert: any) {
        if (!browser) return;

        const mode = getNotificationMode();
        if (mode === "Do Not Disturb") return;

        new Notification(alert.alertTitle ?? "New alert");
    }

    onMount(() => {
        const interval = setInterval(() => {
            invalidate("app:alerts");
        }, 15_000);

        return () => clearInterval(interval);
    });

    $effect(() => {
        const incoming = data.userAlerts ?? [];
        console.log(incoming)
        
        untrack(() => {
            if (incoming.length > notifications.length) {
                const newest = incoming[incoming.length - 1];
                showBrowserNotification(newest);
            }
            notifications = incoming;
        });
    });

</script>

<div class="{$theme} app h-screen grid grid-rows-[64px_1fr_64px] md:grid-rows-[64px_1fr] bg-[#FFFFFF] {sidebarOpen ? "md:grid-cols-[240px_1fr]" : "md:grid-cols-1"}">
    <header class="{sidebarOpen ? "col-span-2" : "col-span-1"} z-50">
        <Navbar toggleSidebar={toggleSidebar} notifications={notifications} title="Dashboard"></Navbar>
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


