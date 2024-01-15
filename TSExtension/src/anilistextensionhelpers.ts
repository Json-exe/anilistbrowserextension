// @ts-ignore
import GET_USER from './graphql/GetUser.graphql';

export async function handleUnauthorized() {
    await browser.storage.local.remove("UserToken");
    await browser.storage.local.remove("UserId");
    await createNotification("AniList Extension", "You are not logged in. Please log in to AniList to use this extension.");
}

export async function createNotification(title: string, message: string) {
    await browser.notifications.create({
        type: "basic",
        iconUrl: browser.runtime.getURL("ExtensionIcon.png"),
        title: title,
        message: message
    })
}

export async function getUserToken() {
    const token = await browser.storage.local.get("UserToken");
    return token["UserToken"];
}

export async function checkIfAuthenticated() {
    if (await getUserToken() === undefined) {
        await createNotification("Not logged in", "Please log in to AniList first via the extension popup!")
        return false;
    } else {
        const options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + await getUserToken(),
            },
            body: JSON.stringify({
                query: GET_USER,
            })
        } as RequestInit;

        const response = await fetch("https://graphql.anilist.co", options);
        if (response.status === 401) {
            await createNotification("Not logged in", "Please log in to AniList first via the extension popup!")
            await handleUnauthorized();
            return false;
        }
        return response.ok;
    }
}