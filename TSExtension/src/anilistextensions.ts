import {checkIfAuthenticated, createNotification, getUserToken, handleUnauthorized} from "./anilistextensionhelpers";
// @ts-ignore
import GET_USER from './graphql/GetUser.graphql';
// @ts-ignore
import SEARCH_MEDIA from './graphql/SearchMedia.graphql';

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
            query: SEARCH_MEDIA,
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
        await createNotification("Error", "Could not fetch user from AniList")
        return;
    }
    const data = await response.json();
    return data.data.Media;
}

async function searchAnimeAndCheckIfOnList(selectionText: string | undefined) {
    if (!await checkIfAuthenticated()) {
        return;
    }
    if (!await getCurrentUser()) {
        return;
    }
    const anime = await searchForAnime(selectionText);
    if (anime) {

    } else {
        await createNotification("Anime not found", "Could not find anime on AniList!")
    }
}

async function getCurrentUser() {
    const userId = await browser.storage.local.get("UserId") as {UserId: string | undefined};
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
            query: GET_USER
        })
    } as RequestInit;

    const response = await fetch(url, options);
    if (response.status == 401 || response.status == 400) {
        await handleUnauthorized();
        return false;
    } else if (!response.ok) {
        await createNotification("Error", "Could not fetch user from AniList!");
        return false;
    }
    const data = await response.json();
    const user = data.data.Viewer;
    await browser.storage.local.set({UserId: user.id});
    return true;
}

browser.menus.create({
    id: "add-anime",
    title: "Add anime to Watchlist",
    type: "normal",
    documentUrlPatterns: ["*://*.crunchyroll.com/*"],
    contexts: ["selection"],
    onclick: (info, tab) => { searchAnimeAndCheckIfOnList(info.selectionText).then() },
})

