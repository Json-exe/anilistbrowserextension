import {execute, UnauthorizedException} from "./graphql/graphqlExecutor";
import {GET_USER_QUERY} from "./graphql/graphqlQuerys";

export async function handleUnauthorized() {
    await chrome.storage.local.remove("UserToken");
    await chrome.storage.local.remove("UserId");
    createNotification("AniList Extension", "You are not logged in. Please log in to AniList to use this extension.");
}

export function createNotification(title: string, message: string) {
    if (chrome.notifications === undefined) {
        return;
    }
    chrome.notifications.create({
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
        createNotification("Not logged in", "Please log in to AniList first via the extension popup!")
        return false;
    } else if (await checkIfAuthCheckIsNeeded()) {
        try {
            const data = await execute(GET_USER_QUERY, {}, {'Authorization': 'Bearer ' + await getUserToken()});
            if (data.Viewer.id !== undefined) {
                const timestamp = addHours(1);
                await chrome.storage.local.set({AuthTimeStamp: timestamp})
                return true;
            } else {
                await handleUnauthorized();
                return false;
            }
        } catch (e) {
            if (e instanceof UnauthorizedException) {
                await handleUnauthorized();
            } else {
                createNotification("Error checking access!", "We currently cant check if you are logged in. Please try again later!")
            }
            return false;
        }
    } else {
        return true;
    }
}

async function checkIfAuthCheckIsNeeded() {
    const currentTime = Date.now();
    const timestamp = await chrome.storage.local.get("AuthTimeStamp") as
        { AuthTimeStamp: number | undefined };
    console.log(`Auth-Timestamp: ${timestamp}`)
    if (timestamp.AuthTimeStamp === undefined) {
        return true;
    }

    return currentTime > timestamp.AuthTimeStamp;
}

function addHours(h: number) {
    let curDate = Date.now()
    return curDate + (36e5 * h)
}