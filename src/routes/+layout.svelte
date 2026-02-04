<script lang="ts">
	import {browser} from "$app/environment";
    import { onMount } from "svelte";
	import { theme } from "$lib/stores/theme";
	let { children } = $props();
</script>

<div class="{$theme} app">
	<main>
		{@render children()}
	</main>
</div>

<style>
</style>
