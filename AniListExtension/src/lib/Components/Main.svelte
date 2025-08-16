<div class="d-flex flex-column h-100 main-content">
    <div class="app-bar">
        <h6 class="text-gradient">AniList Companion</h6>
        <button class="btn btn-outline" onclick={logout}>
            Abmelden
        </button>
    </div>

    <div class="flex-grow-1">
        {#if !animeInfo}
            <div class="text-center p-4">
                <div class="alert alert-info">
                    <strong>Kein Inhalt erkannt</strong><br>
                    Bitte navigiere zu einer Crunchyroll-Serienseite! Falls du dich gerade eingeloggt hast, lade die Crunchyroll-Seite bitte neu.
                </div>
            </div>
        {:else}
            <div class="anime-card">
                <div class="text-center mb-4">
                    <img 
                        alt="Anime Cover"
                        src={animeInfo.image || "https://anilist.co/img/icons/icon.svg"}
                        class="anime-image object-fit-cover mx-auto d-block"
                    />
                </div>

                <div class="text-center">
                    <h5 class="anime-title">{animeInfo.title}</h5>

                    <div class="mb-3">
                        <span class="anime-status">
                            {animeInfo.mediaListStatus || "Nicht in der Liste"}
                        </span>
                    </div>

                    <a 
                        href={animeInfo.siteUrl}
                        target="_blank"
                        class="btn btn-primary w-100 link-underline-none"
                        style="max-width: 200px;"
                    >
                        AniList-Seite öffnen
                    </a>
                </div>
            </div>
        {/if}
    </div>
</div>

<script lang="ts">
    import {AnimeInfo} from "@/lib/interfaces";

    let {refresh}: { refresh: () => Promise<void> } = $props();
    let animeInfo = $state<AnimeInfo | undefined>(undefined);

    async function logout() {
        await browser.storage.local.remove("UserToken");
        await browser.storage.local.remove("UserId");
        await refresh()
    }

    async function updateAnimeInfo() {
        animeInfo = (await browser.storage.local.get("AnimeInfo") as { AnimeInfo: AnimeInfo | undefined }).AnimeInfo;
    }

    updateAnimeInfo().then(() => console.log("Anime info updated from local storage!"));
</script>