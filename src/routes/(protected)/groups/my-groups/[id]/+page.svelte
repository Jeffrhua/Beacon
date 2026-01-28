<script lang="ts">
    import {page} from '$app/state';
    let { id } = page.params;
    let { data } = $props();
    if(data.error){
        console.log("Not found")
    }
</script>

<div>
    {#if data.group}
        <h1 class="text-2xl">{data.group.title}</h1>
        <h2 class="text-2md">{data.group.description}</h2>
    {/if}
</div>


<style>

</style>