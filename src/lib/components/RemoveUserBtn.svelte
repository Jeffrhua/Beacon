<script>
    import { Button, Modal,  P } from "flowbite-svelte";
    let { kickConfirmation = $bindable(), user } = $props()
</script>  

<Modal title="Kick group member" form bind:open={kickConfirmation}>
    <form method="POST" action="?/removeUser" class="flex flex-col space-y-6">
        <P>Are you sure you want to remove {user.displayName ? user.displayName : user.name}?</P>
        
        <!-- Pass user id to delete -->
        <input type="hidden" name="userId" value={user.id} />

        <Button type="submit" name ="res" value="success">Yes</Button>
        <Button type="button" color="alternative" onclick={() => (kickConfirmation = false)}>No</Button>
    </form>
</Modal>