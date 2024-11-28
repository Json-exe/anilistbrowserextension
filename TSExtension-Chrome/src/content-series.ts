import {getUserToken, handleUnauthorized} from "./anilistextensionhelpers";
import {MessageData, RequestType, ResponseData, AnimeInfo} from "./Interfaces";
import {execute, UnauthorizedException} from "./graphql/graphqlExecutor";
import {SEARCH_MEDIA_CONTENT_QUERY, SEARCH_MEDIA_QUERY} from "./graphql/graphqlQuerys";


async function checkAuth() {
    const message: MessageData = {Type: RequestType.Auth}
    const response = await chrome.runtime.sendMessage(message) as ResponseData;
    return response.success;
}

async function sendAnimeInfoToPopup(info: AnimeInfo) {
    await chrome.storage.local.set({AnimeInfo: info});
}

const observerUrlChange = async () => {
    if (!await checkAuth()) {
        return;
    }
    let old = document.location.href;
    const observer = new MutationObserver(mutations => {
        if (old !== document.location.href) {
            old = document.location.href;
            if (old.includes("series")) {
                setTimeout(() => getHeadingLineAndAddElementToIt(), 250)
            }
        }
    })
    observer.observe(document.body, {childList: true, subtree: true})
}

async function getHeadingLineAndAddElementToIt() {
    console.log("Getting title element!")
    let result = document.getElementsByClassName("app-body-wrapper")[0].getElementsByClassName("body")[0].children[0];
    console.log(result);
    const title = result.children[0] as HTMLHeadingElement;
    console.log(title.innerText)
    const data = await searchForAnime(title.innerText);
    await sendAnimeInfoToPopup(new AnimeInfo(data.id, data.title.english, data.siteUrl, data.mediaListEntry.status, data.coverImage.medium));
    const info = document.createElement("div");
    const link = document.createElement("a");
    info.className = "new-element-class";
    info.style.border = "1px solid blue";
    info.style.borderRadius = "24px";
    info.style.padding = "7px";
    link.target = "_blank";
    link.style.fontWeight = "bold";
    link.style.textDecoration = "underline";
    if (data) {
        const isOnList = data.mediaListEntry.status !== null;
        link.href = data.siteUrl ?? "";
        if (isOnList) {
            link.text = "Already On List!";
            info.style.borderColor = "green";
        } else {
            link.text = "Not on List!";
            info.style.borderColor = "red";
        }
    } else {
        link.href = `https://anilist.co/search/anime?search=${title.innerText}`;
        link.text = "Not found on AniList!"
        info.style.borderColor = "yellow";
    }
    info.appendChild(link);
    result.appendChild(info);
}

window.onload = observerUrlChange;
window.addEventListener("load", async () => {
    if (!await checkAuth()) {
        return;
    }
    if (document.location.href.includes("series")) {
        setTimeout(() => getHeadingLineAndAddElementToIt(), 1500)
    }
})

async function searchForAnime(searchText: string) {
    try {
        const data = await execute(SEARCH_MEDIA_CONTENT_QUERY, {search: searchText}, {'Authorization': 'Bearer ' + await getUserToken()});
        return data.Media;
    } catch (e) {
        if (e instanceof UnauthorizedException) {
            await handleUnauthorized();
        }
        return null;
    }
}