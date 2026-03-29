<script lang="ts">
  import { Modal, Button, Listgroup } from "flowbite-svelte";
  let { groupChatForm = $bindable(false), friends = $bindable([]) } = $props();

  let selectedUsers: string[] = $state([]);

  function toggleUser(id: string, checked: boolean) {
    if (checked) {
      selectedUsers = [...selectedUsers, id];
    } else {
      selectedUsers = selectedUsers.filter((userId) => userId !== id);
    }
  }
</script>

<Modal form bind:open={groupChatForm} size="xs">
  <form
    method="POST"
    action="?/addUsersToConversation"
    class="flex flex-col space-y-6"
  >
    <!-- send all selected user ids as one comma-separated string -->
    <input type="hidden" name="users" value={selectedUsers.join(",")} />
    <h1 class="text-xl">Select Friends to message</h1>
    <Listgroup items={friends} class="border-0">
      {#snippet children(item)}
        <label class="flex items-center space-x-4 py-2 rtl:space-x-reverse cursor-pointer">
          <input
            type="checkbox"
            checked={selectedUsers.includes(item.id)}
            onchange={(e) => toggleUser(item.id, e.currentTarget.checked)}
          />

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
              {item.name}
            </p>
            <p class="truncate text-sm text-gray-500 dark:text-gray-400">
              {item.email}
            </p>
          </div>
        </label>
      {/snippet}
    </Listgroup>

    <Button type="submit" disabled={selectedUsers.length === 0}>
      Create Chat
    </Button>
  </form>
</Modal>