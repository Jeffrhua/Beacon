<script lang="ts">
    let {toggleSidebar, title, notifications = []} = $props();
	import { HomeSolid, BellSolid } from 'flowbite-svelte-icons';

</script>

<div class="w-full flex items-center justify-between px-4 py-3 border-b bg-gray-50">
    <button class="p-2 hover:bg-gray-200 rounded" onclick={toggleSidebar} aria-label="Toggle menu">
		☰
	</button>
    <div class ="flex items-center gap-2 w-full justify-center">
        <HomeSolid class="shrink-0 h-6 w-6" />
        <h1 class="text-lg font-semibold">
            {title}
        </h1>
    </div>
    <div>
        <BellSolid class="shrink-0 h-7 w-7 cursor-pointer dark:text-white hover:text-gray-700 "/>
    </div>
</div>
