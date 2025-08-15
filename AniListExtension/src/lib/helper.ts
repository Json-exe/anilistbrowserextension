import {execute, UnauthorizedException} from "@/graphql/executor";
import {GET_USER_QUERY} from "@/graphql/queries";

export async function handleUnauthorized() {
    await browser.storage.local.remove("UserToken");
    await browser.storage.local.remove("UserId");
    createNotification("AniList Extension", "You are not logged in. Please log in to AniList to use this extension.");
}

export function createNotification(title: string, message: string) {
    if (browser.notifications === undefined) {
        return;
    }
    browser.notifications.create({
        type: "basic",
        iconUrl: browser.runtime.getURL("/icon/48.png"),
        title: title,
        message: message
    })
}

export async function getUserToken() {
    const token = await browser.storage.local.get("UserToken");
    return token["UserToken"];
}

export async function checkIfAuthenticated(forceCheck: boolean = false) {
    if (await getUserToken() === undefined) {
        createNotification("Not logged in", "Please log in to AniList first via the extension popup!")
        return false;
    } else if (forceCheck || await checkIfAuthCheckIsNeeded()) {
        try {
            const data = await execute(GET_USER_QUERY, {}, {'Authorization': 'Bearer ' + await getUserToken()});
            if (data.Viewer?.id !== undefined) {
                const timestamp = addHours(1);
                await browser.storage.local.set({AuthTimeStamp: timestamp})
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
    const timestamp = await browser.storage.local.get("AuthTimeStamp") as
        { AuthTimeStamp: number | undefined };
    if (timestamp.AuthTimeStamp === undefined) {
        return true;
    }

    return currentTime > timestamp.AuthTimeStamp;
}

function addHours(h: number) {
    let curDate = Date.now()
    return curDate + (36e5 * h)
}