<script>
    import { Button, Modal, P } from "flowbite-svelte";
    let {deleteGroupForm = $bindable(false)} = $props();
</script>


<Modal title="Delete Group" form bind:open={deleteGroupForm}>
    <form method="POST" action="?/groupDelete" class="flex flex-col space-y-6">
        <P>Are you sure you want to delete this group?</P>
        <Button type="submit" name ="res" value="success">Yes</Button>
        <Button type="button" color="alternative" onclick={() => (deleteGroupForm = false)}>No</Button>
    </form>
</Modal>