<script>
    import { Modal, Input, Button } from "flowbite-svelte";
    let {groupChatForm = $bindable(false)} = $props();
</script>

<Modal form bind:open={groupChatForm} size="xs">
    <form method="POST" action="?/addUsersToConversation" class="flex flex-col space-y-6">
        <!-- Eventually change this to just be able to click user profile "add" buttons to add to conversation -->
        <Input type="text" name="users" placeholder="Enter list of Ids (Comma-Separated)" required />

        <Button type="submit" value="createChat">Create chat</Button>
    </form>
</Modal>