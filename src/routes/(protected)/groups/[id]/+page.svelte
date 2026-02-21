<script lang="ts">
    import { page } from "$app/state";
    import { Card, Listgroup, Button, Group } from "flowbite-svelte";
    import { UserOutline } from "flowbite-svelte-icons";
    import { formatDate } from "$lib/utils.js";
    import { jsPDF } from "jspdf";
    import { autoTable } from "jspdf-autotable";
    import SendAlertModal from "$lib/components/SendAlertModal.svelte";
    import SeverityBadge from "$lib/components/SeverityBadge.svelte";
    import JoinGroupBtn from "$lib/components/JoinGroupBtn.svelte";
    import RemoveGroupBtn from "$lib/components/RemoveGroupBtn.svelte";
    import DeleteGroupBtn from "$lib/components/DeleteGroupBtn.svelte";
    import GroupSettings from "$lib/components/GroupSettings.svelte";

    let { id } = page.params;
    let { data } = $props();
    let formModal = $state(false);
    let deleteGroupForm = $state(false);
    let settingsModal = $state(false);
    let alerts = data.alerts ? data.alerts : [];
    const isOwner = data.owner?.id === data.currentUser;
    const isAdmin = data.isAdmin;

    const exportAlertsToPDF = () => {
        if(!data.group) return;
        const columns = ["Alert Id", "Title", "Description", "Severity", "Long", "Lat", "Address", "Sent By", "Date Created"]
        const rows = alerts.map((a) => [
            a.id.toString(),
            a.title.toString(),
            a.description.toString(),
            a.severity.toString(),
            a.longitude.toString(),
            a.latitude.toString(),
            a.address.toString(),
            a.user_id.toString(),
            formatDate(a.dateCreated)
        ]);
        var doc = new jsPDF({ orientation: "landscape" });
        doc.text(`Alert Report for ${data.group.title} (${data.group.id})`,10,10)
        autoTable(doc, {
            head: [columns],
            body: rows,
            styles: {
                fontSize: 8,
            }
        });
        doc.save(`${data.group.title}_${data.group.id}_Report_${formatDate(new Date())}`)
    };
</script>

<div class="grid h-full grid-cols-[75%_1fr] grid-rows-1 gap-2">
    <!-- Main Body -->
    <div>
        {#if data.group}
            <h1 class="text-2xl">{data.group.title}</h1>
            <h2 class="text-2md">{data.group.description}</h2>
        {/if}
    </div>

    <!-- Right side area with two cards -->
    <div class="flex flex-col m-2 overflow-x-hidden">
        <!-- Info Card -->
        <Card class="p-4 w-full max-w-none">
            <div class="flex items-center">
                <h5
                    class="text-xl leading-none font-bold text-gray-900 dark:text-white"
                >
                    Info
                </h5>
                <div class="ml-auto flex items-center">
                    <UserOutline
                        class="h-5 w-5 translate-x-[-5px] text-gray-900 dark:text-white"
                    />
                    <p class="text-gray-900 dark:text-white">
                        {data.users.length}
                    </p>
                </div>
            </div>

            <div>
                <h6 class="text-md font-semibold text-gray-900 dark:text-white">
                    Owner:
                </h6>
                {#if data.owner}
                    <p class="text-gray-900 dark:text-white">
                        {data.owner.displayName
                            ? data.owner.displayName
                            : data.owner.name}
                    </p>
                {/if}
            </div>
            <div>
                <h6 class="text-md font-semibold text-gray-900 dark:text-white">
                    Members:
                </h6>

                {#if data.users}
                    <Listgroup
                        items={data.users}
                        class="border-0 dark:bg-transparent"
                    >
                        {#snippet children(user)}
                            {#if user.id != data.owner?.id}
                                <div class="flex items-center py-2">
                                    <p
                                        class="text-sm font-sm text-gray-900 dark:text-white"
                                    >
                                        {user.displayName
                                            ? user.displayName
                                            : user.name}
                                    </p>
                                </div>
                            {/if}
                        {/snippet}
                    </Listgroup>
                {/if}
            </div>
        </Card>

        <!-- Alerts Display Area -->
        <Card class="p-4 w-full flex-1 max-w-none">
            <div class="mb-4 flex items-center justify-between">
                <h5
                    class="text-xl leading-none font-bold text-gray-900 dark:text-white"
                >
                    Latest Alerts
                </h5>
                <button class="text-[12px]" onclick={exportAlertsToPDF}>Export</button>

            </div>
            <Listgroup items={alerts} class="border-0 dark:bg-transparent">
                {#snippet children(alert)}
                    <div
                        class="flex items-center space-x-4 py-2 rtl:space-x-reverse"
                    >
                        <div class="min-w-0 flex-1">
                            <p
                                class="truncate text-sm font-medium text-gray-900 dark:text-white"
                            >
                                {alert.title}
                            </p>
                            <p
                                class="truncate text-sm text-gray-500 dark:text-gray-499"
                            >
                                {alert.description}
                            </p>
                        </div>
                        <div
                            class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
                        >
                            <SeverityBadge severity={alert.severity}
                            ></SeverityBadge>
                        </div>
                    </div>
                {/snippet}
            </Listgroup>
        </Card>

        {#if !data.isMember}
            <JoinGroupBtn></JoinGroupBtn>
        {/if}

        {#if data.isMember && !isOwner}
            <RemoveGroupBtn></RemoveGroupBtn>
        {/if}

        {#if isOwner || isAdmin}
            <Button onclick={() => (formModal = true)}>Send an alert</Button>
            <SendAlertModal bind:formModal></SendAlertModal>
        {/if}

        {#if isOwner}
            <Button onclick={() => (settingsModal = true)}>Settings</Button>
            <GroupSettings
                bind:settingsModal
                users={data.users}
                owner={data.owner}
            ></GroupSettings>
            <Button onclick={() => (deleteGroupForm = true)}
                >Delete group</Button
            >
            <DeleteGroupBtn bind:deleteGroupForm></DeleteGroupBtn>
        {/if}
    </div>
</div>

<style>
</style>
