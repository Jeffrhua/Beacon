<script lang="ts">
  import { enhance } from "$app/forms"; 
  import { Card, Listgroup, Avatar, Input } from "flowbite-svelte";
  import { SearchOutline } from "flowbite-svelte-icons";

  let { data } = $props();
  let query = $state("");
  let addedIds = $state(new Set<string>());

  let results = $derived(
    query.trim().length === 0
      ? []
      : (data.all_users || []).filter(
          (u) =>
            u.name.toLowerCase().includes(query.toLowerCase()) ||
            u.email.toLowerCase().includes(query.toLowerCase()),
        ),
  );
</script>

<div class="w-full h-full flex flex-row justify-center">
  <!-- Friends List -->
  <Card class="p-4 sm:p-8 md:p-10 h-full" size="md">
    <div class="mb-4 flex items-center justify-between">
      <h5 class="text-xl leading-none font-bold text-gray-900 dark:text-white">
        Added Friends
      </h5>
    </div>
    <Listgroup items={data.friends || []} class="border-0">
      {#snippet children(item)}
        <div class="flex items-center space-x-4 py-2 rtl:space-x-reverse">
          <div class="min-w-0 flex-1">
            <p
              class="truncate text-sm font-medium text-gray-900 dark:text-white"
            >
              {item.name}
            </p>
            <p class="truncate text-sm text-gray-500 dark:text-gray-400">
              {item.email}
            </p>
          </div>
          <form method="POST" action="?/removeFriend" use:enhance>
          <input type="hidden" name="friendId" value={item.id} />
          <button
            type="submit"
            onclick={() => addedIds = addedIds.delete(item.id)}
            class="text-xs px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600
                   disabled:text-green-600 disabled:border-green-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Remove
          </button>
        </form>
        </div>
      {/snippet}
    </Listgroup>
  </Card>

  <!-- Add Friends -->
  <Card class="p-4 sm:p-8 md:p-10 h-full" size="md">
    <div class="mb-4 flex items-center justify-between">
      <h5 class="text-xl leading-none font-bold text-gray-900 dark:text-white">
        Add Friends
      </h5>
    </div>

    <Input
      bind:value={query}
      placeholder="Search by name or email..."
      class="mb-4"
    >
      {#snippet left()}
        <SearchOutline class="w-4 h-4 text-gray-500" />
      {/snippet}
    </Input>

    {#if results.length > 0}
  <ul class="divide-y divide-gray-200 dark:divide-gray-700">
    {#each results as item}
      <li class="flex items-center space-x-4 py-2 rtl:space-x-reverse m-3">
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
            {item.name}
          </p>
          <p class="truncate text-sm text-gray-500 dark:text-gray-400">
            {item.email}
          </p>
        </div>
        <form method="POST" action="?/addFriend" use:enhance>
          <input type="hidden" name="friendId" value={item.id} />
          <button
            type="submit"
            onclick={() => addedIds = new Set([...addedIds, item.id])}
            class="text-xs px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600
                   disabled:text-green-600 disabled:border-green-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {addedIds.has(item.id) ? "Added" : "+ Add"}
          </button>
        </form>
      </li>
    {/each}
  </ul>
{:else if query.trim().length > 0}
  <p class="text-sm text-gray-500 text-center py-4">No users found.</p>
{/if}
  </Card>
</div>
