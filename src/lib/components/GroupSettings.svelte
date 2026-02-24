<script>
    import { Button, Modal, Listgroup, Input, Label } from "flowbite-svelte";
    import { HammerSolid } from "flowbite-svelte-icons";
    import RemoveUserBtn from "./RemoveUserBtn.svelte";
    let { settingsModal = $bindable(), users = [], owner, group } = $props()
    let kickConfirmation = $state(false);
    let selectedUser = $state(null);

</script>   

<Modal title="Group Settings" bind:open={settingsModal} size="sm">
    <h2 class="text-2xl sm:text-3xl">Group Info</h2>
    <!-- Group Settings Form -->
    <form id="groupSettingsForm" method="POST" action="?/saveGroupSettings">
        <input type="hidden" name="owner_id" value={owner.id} />
        <input type="hidden" name="group_id" value={group.id} />
        <div class="mb-6 grid gap-4">
            <div>
                <Label for="group_title" class="mb-2">Group title</Label>
                <Input type="text" id="group_title" name="group_title" placeholder={group.title} defaultValue={group.title} required />
            </div>
            <div>
                <Label for="group_description" class="mb-2">Group description</Label>
                <Input type="text" id="group_description" name="group_description" placeholder={group.description} defaultValue={group.description} required />
            </div>
        </div>
    </form>

    <!-- User setting admin form -->
    <h2 class="text-2xl sm:text-3xl">Users</h2>
    <Listgroup items={users} class="border-0 dark:bg-transparent">
        {#snippet children(user)}
        {#if user.id != owner.id}
            <div class = "flex items-center py-2">
                <p class="flex items-center justify-between w-full text-sm text-gray-900 dark:text-white">
                    <span>
                        {user.displayName ? user.displayName : user.name}
                    </span>
                    <Button onclick={() => {selectedUser = user; kickConfirmation = true;}}>
                        <HammerSolid class="ml-auto h-5 w-5 shrink-0" />
                    </Button>
                </p>
            </div>
        {/if}
        {/snippet}
    </Listgroup>
    {#if selectedUser}
        <RemoveUserBtn bind:kickConfirmation user={selectedUser}/>
    {/if}

  {#snippet footer()}
    <div class="flex justify-between w-full">
        <Button type="submit" form="groupSettingsForm">Save Settings</Button>
        <Button type="button" onclick={() => settingsModal = false}>Cancel</Button>
    </div>
  {/snippet}
</Modal>