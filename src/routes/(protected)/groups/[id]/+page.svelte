<script lang="ts">
    import {page} from '$app/state';
    import {Card, Listgroup, Button, Modal, Label, Input, Select, Textarea} from "flowbite-svelte";
    import {UserOutline} from "flowbite-svelte-icons";
    import SendAlertModal from '$lib/components/SendAlertModal.svelte';

    let { id } = page.params;
    let { data } = $props();
    let formModal = $state(false);
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
    console.log(data.owner)

    const isOwner = data.owner?.id === data.currentUser?.id;

</script>

<div class="grid h-full grid-cols-[75%_1fr] grid-rows-1 gap-2">
    <div>
        {#if data.group}
            <h1 class="text-2xl">{data.group.title}</h1>
            <h2 class="text-2md">{data.group.description}</h2>
        {/if}
    </div>
    <div class="flex flex-col m-2">
        <Card class="p-4 w-full max-w-none">
            <div class="flex items-center">
                <h5 class="text-xl leading-none font-bold text-gray-900 dark:text-white">Info</h5>
                <div class="ml-auto flex items-center">
                    <UserOutline class="h-5 w-5 translate-x-[-5px]"/> 
                    <p>{data.users.length}</p>
                </div>

            </div>

            <div>
                <h6 class="text-md font-semibold text-gray-900 dark:text-white">Owner:</h6>
                {#if data.owner}
                    <p>{data.owner.displayName ? data.owner.displayName : data.owner.name}</p>
                {/if}
            </div>
            <div>
                <h6 class="text-md font-semibold text-gray-900 dark:text-white">Members:</h6>
                
                {#if data.users}
                    <Listgroup items={data.users} class="border-0 dark:bg-transparent">
                        {#snippet children(user)}
                            <div class = "flex items-center py-2">
                                <p class="text-sm font-sm text-gray-900 dark:text-white">{user.displayName ? user.displayName : user.name}</p>
                            </div>
                        {/snippet}
                    </Listgroup>
                {/if}
            </div>
        </Card>

        <Card class="p-4 w-full flex-1 max-w-none">
            <div class="mb-4 flex items-center justify-between">
                <h5 class="text-xl leading-none font-bold text-gray-900 dark:text-white">Latest Alerts</h5>
            </div>
            <Listgroup items={alerts} class="border-0 dark:bg-transparent">
                {#snippet children(alert)}
                <div class="flex items-center space-x-4 py-2 rtl:space-x-reverse">
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{alert.title}</p>
                        <p class="truncate text-sm text-gray-500 dark:text-gray-499">{alert.description}</p>
                    </div>
                    <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                        {alert.severity}
                    </div>
                </div>
                {/snippet}
            </Listgroup>
        </Card>

        {#if isOwner}
            <Button onclick={() => (formModal = true)}>Send an alert</Button>
            <SendAlertModal bind:formModal></SendAlertModal>
        {/if}

    </div>
</div>


<style>

</style>