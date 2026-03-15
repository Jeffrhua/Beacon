<script lang="ts">
    import { PenSolid } from "flowbite-svelte-icons";
    import { Button, Card, Listgroup } from "flowbite-svelte";
    let mock_users = [{ name: "User1", id: 1 }, { name: "User2", id: 2 }, { name: "User3", id: 3 }];
    let current_conversation = mock_users[0].id;
    
</script>

<div class="p-5 flex flex-row h-full">
    <div class="conversations flex-none">
        <div class="pb-5">
            <Button size="xs"
                ><PenSolid class="shrink-0 h-6 w-6" /> New Message</Button
            >
        </div>
        <Card>
            <Listgroup items={mock_users} class="border-0">
                {#snippet children(item)}
                    <div
                        class="flex items-center space-x-4 py-2 rtl:space-x-reverse"
                    >
                        {#if typeof item === "object"}
    
                            <div class="min-w-0 flex-1">
                                <p
                                    class="truncate text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    {item.name}
                                </p>
                            </div>
                        {/if}
                    </div>
                {/snippet}
            </Listgroup>
        </Card>
    </div>

    <div class="conversation flex-1">
        <p>conversation</p>
    </div>
</div>

<style>
    .conversations {
        background-color: blue;
        width:20%;
    }
    .conversation {
        background-color: red;
    }
</style>
