<script>
    import { Button, Modal, Listgroup } from "flowbite-svelte";
    import { HammerSolid } from "flowbite-svelte-icons";
    import RemoveUserBtn from "./RemoveUserBtn.svelte";
    let { settingsModal = $bindable(), users = [], owner } = $props()
    let kickConfirmation = $state(false);
    let selectedUser = $state(null);

</script>   

<Modal title="Group Settings" bind:open={settingsModal} size="sm">
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
    <Button type="submit" onclick={() => settingsModal = false}>Exit</Button>
  {/snippet}
</Modal>