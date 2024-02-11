import {getUserQuery} from "./graphql/graphqlQuerys";

export async function handleUnauthorized() {
    await chrome.storage.local.remove("UserToken");
    await chrome.storage.local.remove("UserId");
    await createNotification("AniList Extension", "You are not logged in. Please log in to AniList to use this extension.");
}

export async function createNotification(title: string, message: string) {
    await chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("ExtensionIcon.png"),
        title: title,
        message: message
    })
}

export async function getUserToken() {
    const token = await chrome.storage.local.get("UserToken");
    return token["UserToken"];
}

export async function checkIfAuthenticated() {
    if (await getUserToken() === undefined) {
        await createNotification("Not logged in", "Please log in to AniList first via the extension popup!")
        return false;
    } else if (await checkIfAuthCheckIsNeeded()) {
        const options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + await getUserToken(),
            },
            body: JSON.stringify({
                query: getUserQuery,
            })
        } as RequestInit;

        const response = await fetch("https://graphql.anilist.co", options);
        if (response.status === 401) {
            await createNotification("Not logged in", "Please log in to AniList first via the extension popup!")
            await handleUnauthorized();
            return false;
        }

        if (response.ok) {
            const timestamp = addHours(1);
            await chrome.storage.local.set({AuthTimeStamp: timestamp})
        }
        return response.ok;
    } else {
        return true;
    }
}

async function checkIfAuthCheckIsNeeded() {
    const currentTime = Date.now();
    const timestamp = await chrome.storage.local.get("AuthTimeStamp") as
        {AuthTimeStamp: number | undefined};
    if (timestamp.AuthTimeStamp === undefined) {
        return true;
    }

    return currentTime > timestamp.AuthTimeStamp;
}

function addHours(h: number) {
    let curDate = Date.now()
    return curDate + (36e5 * h)
}