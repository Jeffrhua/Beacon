<script lang="ts">
    let users = [];
    let loading = false;
    let error = null;

    async function getUsers(){
        loading = true;
        error = null;
        try{
            const res = await fetch('/api/users');
            if (!res.ok){
                throw new Error('AHHH');
            }
            users = await res.json();
        }catch (err){
            error = err.message;
        }finally{
            loading = false
        }
    }
</script>

<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>


<button on:click={getUsers}> Get Users</button>



<style>
</style>
