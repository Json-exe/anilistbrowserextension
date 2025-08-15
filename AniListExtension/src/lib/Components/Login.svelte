<div class="gap-3 mx-3 vstack d-flex" id="login-div" style="align-items: center; justify-content: center;">
    {#if notifyText.length > 0}
        <div style="width: 80%; padding: 5px; border: 1px solid red; border-radius: 50px;
            justify-content: center; align-items: center; background-color: rgba(255, 0, 0, 0.2)"
             class="d-flex">
            <h6 style="margin: 0">
                {notifyText}
            </h6>
        </div>
    {/if}
    <h5>1. Login</h5>
    <a class="btn-primary btn action-elements" style="background: blue;"
       href="https://anilist.co/api/v2/oauth/authorize?client_id=16256&response_type=token"
       target="_blank">
        Login
    </a>
    <h5>2. Paste</h5>
    <label class="text-center">
        Enter token you copied from the AniList login page:
        <br/>
        <input class="mt-2 form-text action-elements text-white" minlength="50" type="text" placeholder="Token"
               bind:value={token}
               disabled={loading}
               required
               style="padding: 5px;">
    </label>
    <h5>3. Confirm, you have to reload Crunchyroll after a successfully login!</h5>
    <button class="btn btn-secondary action-elements" id="confirm-login" onclick={confirmLogin} disabled={loading}>
        Confirm
    </button>
</div>

<script lang="ts">
    import {checkIfAuthenticated} from "../helper";

    let notifyText = $state("");
    let token = $state("");
    let loading = $state(false);

    let {refresh}: { refresh: () => Promise<void>; } = $props();

    async function confirmLogin() {
        loading = true;

        try {
            hideError()
            if (token === undefined || token.length <= 50) {
                showError("The token was incorrect!")
                return;
            }

            await browser.storage.local.set({UserToken: token});
            if (await checkIfAuthenticated(true)) {
                await refresh();
            } else {
                await browser.storage.local.remove("UserToken");
                showError("The token was invalid!")
            }
        } finally {
            loading = false;
        }
    }

    function showError(text: string) {
        notifyText = text
    }

    function hideError() {
        notifyText = ""
    }
</script>