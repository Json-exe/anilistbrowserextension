<div class="login-container">
    <div class="text-center mb-4">
        <h4 class="text-gradient mb-2">AniList Anmeldung</h4>
        <p class="text-muted">Verbinde dich mit deinem AniList-Konto</p>
    </div>

    <div class="login-step">
        <div class="step-number">1</div>
        <h6 class="mb-3">Bei AniList anmelden</h6>
        <p class="text-muted small mb-3">Klicke auf den Button, um zur AniList-Anmeldung zu gelangen.</p>
        <a 
            class="btn btn-primary w-100 link-underline-none"
            href="https://anilist.co/api/v2/oauth/authorize?client_id=16256&response_type=token"
            target="_blank">
            AniList öffnen
        </a>
    </div>

    <div class="login-step">
        <div class="step-number">2</div>
        <h6 class="mb-3">Token einfügen</h6>
        <p class="text-muted small mb-3">Kopiere das Token von der AniList-Seite und füge es hier ein:</p>
        <input 
            class="form-control" 
            type="text" 
            placeholder="Dein AniList Token hier einfügen..."
            bind:value={token}
            disabled={loading}
            minlength="50"
            required
        />
    </div>

    <div class="login-step">
        <div class="step-number">3</div>
        <h6 class="mb-3">Anmeldung bestätigen</h6>
        <p class="text-muted small mb-3">Nach erfolgreicher Anmeldung musst du Crunchyroll neu laden!</p>
        <button 
            class="btn btn-secondary w-100" 
            onclick={confirmLogin} 
            disabled={loading || !token || token.length < 50}>
            {#if loading}
                <span class="spinner-border spinner-border-sm me-2"></span>
                Wird verarbeitet...
            {:else}
                Anmeldung bestätigen
            {/if}
        </button>
        {#if notifyText.length > 0}
            <div class="alert alert-danger" style="margin-bottom: 0; padding: 8px">
                {notifyText}
            </div>
        {/if}
    </div>
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