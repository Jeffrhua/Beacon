<script lang="ts">
    import {page} from '$app/state';
    import { Card, Listgroup } from "flowbite-svelte";

    let { id } = page.params;
    let { data } = $props();
    if(data.error){
        console.log("Not found")
    }
    let alerts = [
        {
            id: 1,
            title: "TestAlert1",
            description: "TestDescription1",
            severity: "low"
        },
        {
            id: 2,
            title: "TestAlert2",
            description: "TestDescription2",
            severity: "medium"
        },
        {
            id: 3,
            title: "TestAlert3",
            description: "TestDescription3",
            severity: "high"
        },
        {
            id: 4,
            title: "TestAlert1",
            description: "TestDescription4",
            severity: "critical"
        },
        {
            id: 4,
            title: "TestAlert1",
            description: "TestDescription5",
            severity: "unknown"
        }]
</script>

<div class="grid h-screen grid-cols-[75%_1fr] grid-rows-1 gap-2">
    <div>
        {#if data.group}
            <h1 class="text-2xl">{data.group.title}</h1>
            <h2 class="text-2md">{data.group.description}</h2>
        {/if}
    </div>
    <div class="flex m-2">
        <Card class="p-4 w-full flex-1 max-w-none">
            <div class="mb-4 flex items-center justify-between">
                <h5 class="text-xl leading-none font-bold text-gray-900 dark:text-white">Latest Alerts</h5>
            </div>
            <Listgroup items={alerts} class="border-0 dark:bg-transparent!">
                {#snippet children(item)}
                <div class="flex items-center space-x-4 py-2 rtl:space-x-reverse">
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                        <p class="truncate text-sm text-gray-500 dark:text-gray-499">{item.description}</p>
                    </div>
                    <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                        {item.severity}
                    </div>
                </div>
                {/snippet}
            </Listgroup>
        </Card>
    </div>
</div>


<style>

</style>