import {checkIfAuthenticated, createNotification, getUserToken, handleUnauthorized} from "./anilistextensionhelpers";
import {MessageData, RequestType, ResponseData} from "./Interfaces";
import {execute, UnauthorizedException} from "./graphql/graphqlExecutor";
import {ADD_MEDIA_TO_LIST_MUTATION, GET_USER_QUERY, SEARCH_MEDIA_QUERY} from "./graphql/graphqlQuerys";

async function searchForAnime(selectionText: string | undefined) {
    try {
        const data = await execute(SEARCH_MEDIA_QUERY, {search: selectionText}, {'Authorization': 'Bearer ' + await getUserToken()});
        return data.Media;
    } catch (e) {
        if (e instanceof UnauthorizedException) {
            await handleUnauthorized();
        }
        return null;
    }
}

async function addAnimeToList(id: number) {
    try {
        const data = await execute(ADD_MEDIA_TO_LIST_MUTATION, {mediaId: id}, {'Authorization': 'Bearer ' + await getUserToken()});
        return data.SaveMediaListEntry !== null;
    } catch (e) {
        if (e instanceof UnauthorizedException) {
            await handleUnauthorized();
        }
        return false;
    }
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
    const media = await searchForAnime(selectionText);
    if (media) {
        const isOnList = media.mediaListEntry !== null;
        if (isOnList) {
            createNotification("Already on list", `${media.title.english} is already on your watchlist`);
            return;
        }
        const success = await addAnimeToList(media.id);
        if (success) {
            createNotification("Added!", `${media.title.english ?? media.title.romaji} was successfully added to your watchlist`)
        } else {
            createNotification("Not added", `Could not add ${media.title.english} to your watchlist. Please try again.`)
        }
    } else {
        createNotification("Not found", `Could not find ${selectionText} on AniList!`)
    }
}

async function getCurrentUser() {
    const userId = await chrome.storage.local.get("UserId") as { UserId: string | undefined };
    if (userId.UserId !== undefined) {
        return true;
    }

    try {
        const data = await execute(GET_USER_QUERY, {}, {'Authorization': 'Bearer ' + await getUserToken()});
        await chrome.storage.local.set({UserId: data.Viewer.id});
        return true;
    } catch (e) {
        if (e instanceof UnauthorizedException) {
            await handleUnauthorized();
        } else {
            createNotification("Error", "Could not fetch user from AniList!")
        }
        return false;
    }
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

chrome.runtime.onMessage.addListener((message: MessageData, sender, sendResponse) => {
        console.log("Received message: ", message)
        const response: ResponseData = {success: false};
        if (message.Type === RequestType.Auth) {
            checkIfAuthenticated().then(auth => {
                response.success = auth;
                sendResponse(response);
            });
        }
        return true;
    }
)