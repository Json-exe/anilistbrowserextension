<script lang="ts">
    import Login from '@/lib/Components/Login.svelte';
    import Main from "@/lib/Components/Main.svelte";

    let loading = true;
    let authenticated = true;

    async function checkIfAuthenticated() {
        const token = await browser.storage.local.get("UserToken") as { UserToken: string | undefined };
        if (token.UserToken === undefined || token.UserToken.length <= 50) {
            authenticated = false;
        } else {
            authenticated = true;
        }
        loading = false;
    }

    checkIfAuthenticated().then();
</script>

<main>
    {#if loading}
        Loading...
    {:else}
        {#if authenticated}
            <Main refresh={checkIfAuthenticated}/>
        {:else}
            <Login refresh={checkIfAuthenticated}/>
        {/if}
    {/if}
</main>