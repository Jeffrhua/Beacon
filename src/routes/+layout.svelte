<script lang="ts">
	import {browser} from "$app/environment";
    import { onMount } from "svelte";
	let { children } = $props();
	let theme = $state("light");
	onMount(()=>{
		if( browser ){
			theme = localStorage.getItem('theme') || 'light';
		}
})
</script>

<div class="{theme} app">
	<main>
		{@render children()}
	</main>
</div>

<style>
</style>
