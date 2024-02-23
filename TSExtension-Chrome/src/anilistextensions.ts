import {checkIfAuthenticated, createNotification, getUserToken, handleUnauthorized} from "./anilistextensionhelpers";
import {getUserQuery, searchMedia, addMediaToList} from './graphql/graphqlQuerys';

const url = "https://graphql.anilist.co";

async function searchForAnime(selectionText: string | undefined) {
    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + await getUserToken(),
        },
        body: JSON.stringify({
            query: searchMedia,
            variables: {
                search: selectionText
            }
        })
    } as RequestInit;

    const response = await fetch(url, options)
    if (response.status === 400 || response.status === 401) {
        await handleUnauthorized()
        return;
    } else if (!response.ok) {
        createNotification("Error", "Could not fetch user from AniList")
        return;
    }
    const data = await response.json();
    return data.data.Media;
}

async function addAnimeToList(id: string) {
    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + await getUserToken(),
        },
        body: JSON.stringify({
            query: addMediaToList,
            variables: {
                mediaId: id
            }
        })
    } as RequestInit;

    const response = await fetch(url, options);

    if (response.status === 400 || response.status === 401) {
        await handleUnauthorized();
        return false;
    } else if (!response.ok) {
        createNotification("Error", "Could not fetch user from AniList")
        return false;
    }

    const data = await response.json() as string;
    return data !== null;
}

async function searchAnimeAndCheckIfOnList(selectionText: string | undefined) {
    if (!await checkIfAuthenticated()) {
        console.log("Not authenticated!")
        return;
    }
    if (!await getCurrentUser()) {
        console.log("Cant get user!")
        return;
    }
    const anime = await searchForAnime(selectionText);
    if (anime) {
        const isOnList = anime.mediaListEntry !== null;
        if (isOnList) {
            createNotification("Anime already on list", "Anime is already on your watchlist");
            return;
        }
        const success = await addAnimeToList(anime.id);
        if (success) {
            createNotification("Anime added", "Anime was successfully added to your watchlist")
        } else {
            createNotification("Anime not added", "Could not add anime to your watchlist")
        }
    } else {
        createNotification("Anime not found", "Could not find anime on AniList!")
    }
}

async function getCurrentUser() {
    const userId = await chrome.storage.local.get("UserId") as {UserId: string | undefined};
    if (userId.UserId !== undefined) {
        return true;
    }

    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + await getUserToken(),
        },
        body: JSON.stringify({
            query: getUserQuery
        })
    } as RequestInit;

    const response = await fetch(url, options);
    if (response.status == 401 || response.status == 400) {
        await handleUnauthorized();
        return false;
    } else if (!response.ok) {
        createNotification("Error", "Could not fetch user from AniList!");
        return false;
    }
    const data = await response.json();
    const user = data.data.Viewer;
    await chrome.storage.local.set({UserId: user.id});
    return true;
}

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "add-anime",
        title: "Add anime to Watchlist",
        type: "normal",
        documentUrlPatterns: ["*://*.crunchyroll.com/*"],
        contexts: ["selection"],
    })
})

chrome.contextMenus.onClicked.addListener(function (info) {
    switch (info.menuItemId) {
        case "add-anime":
            searchAnimeAndCheckIfOnList(info.selectionText).then();
            break;
    }
})

chrome.scripting.registerContentScripts([
    {
        id: "content_series",
        js: ["content_series.js"],
        persistAcrossSessions: false,
        matches: ["https://www.crunchyroll.com/*"],
        runAt: "document_start",
    }
]).then(() => console.log("Registration complete!")).catch((err) => console.warn("unexpected error on registration.", err))