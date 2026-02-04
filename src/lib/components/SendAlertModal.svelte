<script>
    import {Button, Modal, Label, Input, Select, Textarea} from "flowbite-svelte";
    let {formModal = $bindable(false)} = $props();
    let error = $state("");
    let severity = $state("");
    let severityLevels = [
        { value: "low", name: "Low" },
        { value: "medium", name: "Medium" },
        { value: "high", name: "High" },
        { value: "critical", name: "Critical"}
    ]
</script>   

<Modal form bind:open={formModal} size="xs">
    <form method="POST" action="?/sendAlert" class="flex flex-col space-y-6">
        <div class="flex flex-col space-y-6">
            <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Send an alert</h3>
            {#if error}
            <Label color="red">{error}</Label>
            {/if}

            <Label class="space-y-2">
            <span>Title</span>
            <Input type="description" name="title" placeholder="Enter a title..." required />
            </Label>
            
            <Label class="space-y-2">
                <span>Location</span>
                <Label class="flex gap-2">
                    <Input type="number" name="longitude" placeholder="longitude..." min={-180} max={180} required />
                    <Input type="number" name="latitude" placeholder="latitude..." min={-90} max={90} required />
                </Label>
                <Input type="description" name="address" placeholder="Enter a address..." required />
            </Label>

            <Label class="space-y-2">
            <span>Description</span>
            <Textarea name="description" placeholder="Enter a description..." rows={4} required class="w-full rounded-lg border p-2"/>
            </Label>
            
            <Label>
                Select a severity level
                <Select class="mt-2" items={severityLevels} name="severity" bind:value={severity} required />
            </Label>

            <Button type="submit" value="sendAlert">Send Alert</Button>
        </div>
    </form>
</Modal>