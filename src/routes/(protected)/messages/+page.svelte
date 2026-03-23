<script lang="ts">
    import { PenSolid } from "flowbite-svelte-icons";
    import { Button, Card, Textarea } from "flowbite-svelte";
    import { onMount } from "svelte";
    import type { GroupChat, Message } from "$lib/types.js";
    import CreateConversationForm from "$lib/components/CreateConversationForm.svelte"

    let { data } = $props();
    let groupChatForm = $state(false);
    let groupChats: GroupChat[] = data.groupChats ? data.groupChats : [];

    let socket: WebSocket;

	let messages = $state<Message[]>([]);
    let newMessage = $state("");

    // Store the selected chat
    let selectedChat = $state<GroupChat | null>(null);
    let selectedChatId = $derived(selectedChat?.id ?? null);
    function openConversation(chat: GroupChat){
        selectedChat = chat;
    }

    // Handle the enter key press
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage()
        }
    }

    function sendMessage() {
        const text = newMessage.trim();
        if (!text || !selectedChat || !socket || socket.readyState !== WebSocket.OPEN) return;

        socket.send(JSON.stringify(({
            type: "chat",
            conversation_id: selectedChat.id,
            from: data.userId,
            to: selectedChat.participants.filter(id => id !== data.userId),
            text: text
        })));

        messages = [...messages, {
            id: "",
            conversation_id: selectedChat.id,
            sender_id: data.userId,
            content: text
        }];
        newMessage = "";
    }
	
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
	    });

        // Listen for any messages
        socket.addEventListener("message", (event) => {
		const msg = JSON.parse(event.data);
        console.log(data.userId, "received message:", msg);

            if (msg.type === "chat") {
                messages = [...messages, {
                id: "",
                conversation_id: msg.conversation_id,
                sender_id: msg.from,
                content: msg.text
            }];
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
            {#each groupChats as chat}
                <Button onclick={() => openConversation(chat)} class="w-full flex items-center space-x-4 py-2 px-2 rtl:space-x-reverse">
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {chat.userDetails.map(u => u.name).join(", ")}
                        </p>
                    </div>
                </Button>
            {/each}
        </Card>
    </div>

    <div class="conversation flex-1 px-2">
    {#if selectedChat}
        <div class="flex h-full flex-col">
            <h2 class="text-lg font-semibold mb-4">
                {selectedChat.userDetails.map((u) => u.name).join(", ")}
            </h2>
            <div class="border-t border-gray-500 my-2"></div>
            <div class="flex-1 overflow-y-auto">
                {#each messages.filter(message => message.conversation_id === selectedChatId) as message}
                    <div class="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2">
                        {`${message.sender_id}: ${message.content}`}
                    </div>
                {/each}
            </div>
            <div class="pt-2">
                <Textarea bind:value={newMessage} placeholder={"Send a message..."} onkeydown={handleKeydown} class="w-full resize-none"/>
            </div>
        </div>
    {:else}
        <p> Create / select a new conversation </p>
    {/if}
    </div>
</div>

<!-- Turning this off for now -->
<!-- <style>
    .conversations {
        background-color: blue;
        width:20%;
    }
    .conversation {
        background-color: red;
    }
</style> -->
