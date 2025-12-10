<script>
    import { client } from "$lib/auth-client";
    const session = client.useSession();
    $: to = $session.data ? "/dashboard" : "/sign-in";
</script>
	
      <div class="flex items-center gap-2 mt-2 mx-auto">
        <a href={to} class="">
          <button>
            {#if $session.data}
              Dashboard
            {:else}
              Sign In
            {/if}
          </button>
        </a>
        {#if $session.data}
          <button on:click={async () => { await client.signOut();}}>Sign Out</button>
        {/if}
      </div>

<style>

</style>