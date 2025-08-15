import {checkIfAuthenticated, createNotification, getUserToken, handleUnauthorized} from "./helper";
import {execute, UnauthorizedException} from "@/graphql/executor";
import {ADD_MEDIA_TO_LIST_MUTATION, GET_USER_QUERY, SEARCH_MEDIA_QUERY} from "@/graphql/queries";

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

export async function searchAnimeAndCheckIfOnList(selectionText: string | undefined) {
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
            createNotification("Already on list", `${media.title?.english ?? media.title?.romaji ?? selectionText} is already on your watchlist`);
            return;
        }
        const success = await addAnimeToList(media.id);
        if (success) {
            createNotification("Added!", `${media.title?.english ?? media.title?.romaji ?? selectionText} was successfully added to your watchlist`)
        } else {
            createNotification("Not added", `Could not add ${media.title?.english ?? media.title?.romaji ?? selectionText} to your watchlist. Please try again.`)
        }
    } else {
        createNotification("Not found", `Could not find ${selectionText} on AniList!`)
    }
}

async function getCurrentUser() {
    const userId = await browser.storage.local.get("UserId");
    if (userId.UserId !== undefined) {
        return true;
    }

    try {
        const data = await execute(GET_USER_QUERY, {}, {'Authorization': 'Bearer ' + await getUserToken()});
        if (!data.Viewer?.id) return false;
        await browser.storage.local.set({UserId: data.Viewer.id});
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