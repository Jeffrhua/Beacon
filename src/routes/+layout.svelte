<script lang="ts">
	import {themeState} from "$lib/states/theme.svelte";
	let { children } = $props();
</script>

<div class="{themeState.value} app">
	<main>
		{@render children()}
	</main>
</div>

<style>
</style>
