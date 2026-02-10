<script>
    import {Button, Modal, Label, Input, Textarea} from "flowbite-svelte";
    let {formModal = $bindable(false)} = $props();
</script>   

<Modal form bind:open={formModal} size="xs">
    <form method="POST" action="?/groupCreate" class="flex flex-col space-y-6">
        <div class="flex flex-col space-y-6">
            <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Create a group</h3>

            <Label class="space-y-2">
            <span>Title</span>
            <Input type="description" name="title" placeholder="Enter a title..." required />
            </Label>
            
            <Label class="space-y-2">
            <span>Description</span>
            <Textarea name="description" placeholder="Enter a description..." rows={4} required class="w-full rounded-lg border p-2"/>
            </Label>

            <Button type="submit" value="sendAlert">Create group</Button>
        </div>
    </form>
</Modal>