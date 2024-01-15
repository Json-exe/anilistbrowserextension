const url = "https://graphql.anilist.co";

browser.menus.create(
    {
        id: "add-anime",
        title: "Add anime to Watchlist",
        type: "normal",
        documentUrlPatterns: ["*://*.crunchyroll.com/*"],
        contexts: ["selection"],
        onclick: (info, tab) => searchAnimeAndCheckIfOnList(info.selectionText),
    },
);

checkIfAuthenticated().then(value => {
    if (value === false) {
        handleUnauthorized();
    }
});

function handleUnauthorized() {
    browser.storage.local.remove('UserToken');
    browser.storage.local.remove('UserId');
    createNotification("Not logged in", "Please log in to AniList first via the extension popup!")
}

async function getUserToken() {
    const token = await browser.storage.local.get('UserToken');
    return token.UserToken;
}

function createNotification(title, message) {
    browser.notifications.create({
        type: "basic",
        iconUrl: browser.extension.getURL("ExtensionIcon.png"),
        title: title,
        message: message
    })
}

async function checkIfAuthenticated() {
    if (await getUserToken() === undefined) {
        createNotification("Not logged in", "Please log in to AniList first via the extension popup!")
        return false;
    } else {
        const response = await fetch("./graphql/GetUser.graphql");
        const query = await response.text();

        const options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + await getUserToken(),
            },
            body: JSON.stringify({
                query: query
            })
        }

        const graphQlResponse = await fetch(url, options);
        if (graphQlResponse.status === 401) {
            createNotification("Not logged in", "Please log in to AniList first via the extension popup!")
            return false;
        }
        return graphQlResponse.ok;
    }
}

async function getCurrentUser() {
    const userId = await browser.storage.local.get("UserId");
    if (userId.UserId !== undefined) {
        return;
    }
    console.log("Fetching current user")

    const response = await fetch("./graphql/GetUser.graphql");
    const query = await response.text();

    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + await getUserToken(),
        },
        body: JSON.stringify({
            query: query
        })
    }

    const request = await fetch(url, options);
    if (request.status === 401 || request.status === 400) {
        handleUnauthorized();
        return;
    } else if (!request.ok) {
        createNotification("Error", "Could not fetch user from AniList")
        return;
    }
    const data = await request.json();
    const user = data.data.Viewer;
    browser.storage.local.set({UserId: user.id});
}

async function searchAnimeAndCheckIfOnList(content) {
    if (await getUserToken() === undefined || await getUserToken().length < 50) {
        createNotification("Not logged in", "Please log in to AniList first via the extension popup!")
        return;
    }
    await getCurrentUser();
    const anime = await searchForAnime(content);
    console.log(anime)
    if (anime) {
        const isOnList = anime.mediaListEntry !== null;
        if (isOnList) {
            createNotification("Anime already on list", "Anime is already on your watchlist")
            return;
        }
        const success = await addAnimeToList(anime.id)
        if (success) {
            createNotification("Anime added", "Anime was successfully added to your watchlist")
        } else {
            createNotification("Anime not added", "Could not add anime to your watchlist")
        }
    } else {
        createNotification("Anime not found", "Could not find anime on AniList")
    }
}

async function addAnimeToList(animeId) {
    const response = await fetch("./graphql/AddMediaToList.graphql");
    const query = await response.text();

    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + await getUserToken(),
        },
        body: JSON.stringify({
            query: query,
            variables: {
                mediaId: animeId
            }
        })
    }

    const responseGraphQl = await fetch(url, options);

    if (responseGraphQl.status === 400 || responseGraphQl.status === 401) {
        handleUnauthorized();
        return;
    } else if (!responseGraphQl.ok) {
        createNotification("Error", "Could not fetch user from AniList")
        return;
    }

    const data = await responseGraphQl.json();
    return data !== null;
}

async function searchForAnime(content) {
    const response = await fetch("./graphql/SearchMedia.gql");
    const query = await response.text();

    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + await getUserToken(),
        },
        body: JSON.stringify({
            query: query,
            variables: {
                search: content
            }
        })
    }

    const responseGraphQl = await fetch(url, options)
    console.log(responseGraphQl.status)
    if (responseGraphQl.status === 400 || responseGraphQl.status === 401) {
        handleUnauthorized();
        return;
    } else if (!responseGraphQl.ok) {
        createNotification("Error", "Could not fetch user from AniList")
        return;
    }
    const data = await responseGraphQl.json();
    return data.data.Media;
}