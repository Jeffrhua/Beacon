<script>
    import { Button, Modal, Listgroup, Input, Label } from "flowbite-svelte";
    import { HammerSolid, ArrowUpOutline } from "flowbite-svelte-icons";
    import RemoveUserBtn from "./RemoveUserBtn.svelte";
    let { settingsModal = $bindable(), users = [], owner, group, userRole, currentUser } = $props()
    let kickConfirmation = $state(false);
    let selectedUser = $state(null);
    let promoteConfirmation = $state(false);
    let selectedPromoteUser = $state(null);

    const canPromote = (targetRole) => {
        if (userRole === "owner") return targetRole === "member" || targetRole === "moderator" || targetRole === "admin";
        if (userRole === "admin" ) return targetRole === "member";
        return false;
    }

</script>   

<Modal title="Group Settings" bind:open={settingsModal} size="sm" class="bg-gray-950!">
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
        {#if user.id != owner.id && user.id != currentUser}
            <div class = "flex items-center py-2">
                <div class="flex items-center justify-between w-full text-sm text-gray-900 dark:text-white">
                    <span>
                        {user.displayName ? user.displayName : user.name}
                        {user.role === "owner" ? " (Owner)" : user.role === "admin" ? " (Admin)" : user.role === "moderator" ? " (Moderator)" : "(Member)"}
                    </span>
                    <div class="flex gap-2 ml-auto">
                        {#if canPromote(user.role)}
                            <Button onclick={() => {selectedPromoteUser = user; promoteConfirmation = true;}}>
                                <ArrowUpOutline class="h-5 w-5 shrink-0" />
                            </Button>
                        {/if}
                        {#if userRole === "owner" || (userRole === "admin" && user.role === "member") }
                        <Button onclick={() => {selectedUser = user; kickConfirmation = true;}}>
                            <HammerSolid class="ml-auto h-5 w-5 shrink-0" />
                        </Button>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
        {/snippet}
    </Listgroup>
    {#if selectedUser}
        <RemoveUserBtn bind:kickConfirmation user={selectedUser}/>
    {/if}

    {#if selectedPromoteUser}
        <Modal title="Confirm Promotion" bind:open={promoteConfirmation} size="sm">
            {#if userRole === "owner" && selectedPromoteUser.role === "admin"}
                <p>Are you sure you want to transfer ownership to {selectedPromoteUser.displayName ?? selectedPromoteUser.name}? You will be demoted to admin.</p>
            {:else}
                <p>Are you sure you want to promote {selectedPromoteUser.displayName ? selectedPromoteUser.displayName : selectedPromoteUser.name}?</p>
            {/if}
            <div class="flex justify-end w-full gap-2">
                <form method="POST" action="?/promoteUser">
                    <input type="hidden" name="userId" value={selectedPromoteUser.id} />
                    <input type="hidden" name="currentRole" value={selectedPromoteUser.role} />
                    <Button type="submit">Confirm</Button>
                </form>
                <Button type="button" onclick={() => promoteConfirmation = false}>Cancel</Button>
            </div>
        </Modal>
    {/if}

  {#snippet footer()}
    <div class="flex justify-between w-full">
        <Button type="submit" form="groupSettingsForm">Save Settings</Button>
        <Button type="button" onclick={() => settingsModal = false}>Cancel</Button>
    </div>
  {/snippet}
</Modal>