<div style="height: 100%" class="vstack d-flex maincontent">
    <div class="appbar">
        <p>Companion</p>
        <button class="btn action-elements text-white border-white" style="max-width: 10px;" onclick={logout}>
            Log-Out
        </button>
    </div>
    <div style="padding: 5px;">
        {#if !animeInfo}
            <div class="mt-3">
                <p class="alert alert-info">
                    No content detected. Please navigate to a Crunchyroll Series Page! If you just logged in, please
                    refresh the Crunchyroll page.
                </p>
            </div>
        {:else}
            <div id="anime-info" class="vstack d-flex">
                <img id="anime-info-image" alt="anime cover"
                     src={animeInfo.image !== undefined ? animeInfo.image : "https://anilist.co/img/icons/icon.svg"}
                     height="200px"
                     class="align-self-center object-fit-contain"/>
                <p id="anime-info-name" class="align-self-center">Name: {animeInfo.title}</p>
                <p id="anime-info-status" class="mt-3">Status: {animeInfo.mediaListStatus ?? "Not on list"}</p>
                <div class="mt-3">
                    <a id="anime-info-list-link"
                       href={animeInfo.siteUrl}
                       target="_blank">
                        AniList Series page
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