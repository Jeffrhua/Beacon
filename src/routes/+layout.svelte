<script lang="ts">
	import { browser } from "$app/environment";
	import { onMount } from "svelte";
	import { theme } from "$lib/stores/theme";
	import '$lib/styles/colors.css';  // Use $lib alias

	onMount(() => {
		const socket = new WebSocket("ws://localhost:8080")
		socket.addEventListener("open", ()=> {
			console.log("Opened")
		})
		return () => socket.close();
	});
	
	let { children } = $props();
</script>

<div class="{$theme} app">
	<main>
		{@render children()}
	</main>
</div>

<style>
	/* Your existing layout-specific styles can stay here */
</style>

