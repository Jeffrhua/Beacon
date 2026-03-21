<script lang="ts">
    import { PenSolid } from "flowbite-svelte-icons";
    import { Button, Card, Listgroup } from "flowbite-svelte";
    import { onMount } from "svelte";
    import CreateConversationForm from "$lib/components/CreateConversationForm.svelte"

    let { data } = $props();
    let groupChatForm = $state(false);
    let groupChats = data.groupChats ? data.groupChats : [];
    let mock_users = [{ name: "User1", id: 1 }, { name: "User2", id: 2 }, { name: "User3", id: 3 }];
    let current_conversation = mock_users[0].id;

    let socket: WebSocket;
	let messages: Array<string> = [];
	
    // Client side web socket logic
	onMount(() => {
        // At some point this should point to a standalone server destination
		socket = new WebSocket("ws://localhost:8080")

        socket.addEventListener("open", () => {
		console.log("Opened");
        
        // Register a user to the websocket when loading in
		socket.send(JSON.stringify({
			type: "register",
			userId: data.userId
		    }));
        
        if (data.userId === "697a753e6edd1ae5e1d85dab"){
            socket.send(JSON.stringify({
                type: "chat",
                from: data.userId,
                to: "69b86cfc0dac729f2dba04af",
                text: "Hello World"
	        }));
        }
	    });

        // Listen for any messages
        socket.addEventListener("message", (event) => {
		const msg = JSON.parse(event.data);
        console.log(data.userId, "received message:", msg);

            if (msg.type === "chat") {
                messages = [...messages, `${msg.from}: ${msg.text}`];
            }
	    });
        
		return () => socket.close();
	});
    
</script>

<div class="p-5 flex flex-row h-full">
    <div class="conversations flex-none">
        <div class="pb-5">
            <Button onclick={() => (groupChatForm = true)} size="xs">
                <PenSolid class="shrink-0 h-6 w-6" /> New Message
            </Button>
            <CreateConversationForm bind:groupChatForm></CreateConversationForm>
        </div>
        <Card>
            <Listgroup items={groupChats} class="border-0">
                {#snippet children(item)}
                    <div
                        class="flex items-center space-x-4 py-2 rtl:space-x-reverse"
                    >
                        {#if typeof item === "object"}
    
                            <div class="min-w-0 flex-1">
                                <p
                                    class="truncate text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    {item.userDetails.map(u => u.name).join(", ")}
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
