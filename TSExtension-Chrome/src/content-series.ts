import {getUserToken, handleUnauthorized} from "./anilistextensionhelpers";
import {MessageData, RequestType, ResponseData, AnimeInfo} from "./Interfaces";
import {execute, UnauthorizedException} from "./graphql/graphqlExecutor";
import {SEARCH_MEDIA_QUERY} from "./graphql/graphqlQuerys";

const url = "https://graphql.anilist.co";

const connection = chrome.runtime.connect({name: "popup"});

async function checkAuth() {
    const message: MessageData = {Type: RequestType.Auth}
    const response = await chrome.runtime.sendMessage(message) as ResponseData;
    return response.success;
}

async function sendAnimeInfoToPopup(info: AnimeInfo) {
    const message: MessageData = {Type: RequestType.AnimeInfo, Value: info}
    connection.postMessage(message);
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
    console.log("Getting element!")
    let result = document.getElementsByClassName("app-body-wrapper")[0].getElementsByClassName("body")[0].children[0];
    console.log(result);
    const title = result.children[0] as HTMLHeadingElement;
    console.log(title.innerText)
    const data = await searchForAnime(title.innerText);
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
        const isOnList = data.mediaListEntry !== null;
        link.href = data.siteUrl ?? "";
        if (isOnList) {
            link.text = "Already On List!";
            info.style.borderColor = "green";
        } else {
            link.text = "Not on List!";
            info.style.borderColor = "red";
        }
        info.appendChild(link);
        result.appendChild(info);
    } else {
        link.href = `https://anilist.co/search/anime?search=${title.innerText}`;
        link.text = "Not found on AniList!"
        info.style.borderColor = "yellow";
    }
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
        const data = await execute(SEARCH_MEDIA_QUERY, {search: searchText}, {'Authorization': 'Bearer ' + await getUserToken()});
        return data.Media;
    } catch (e) {
        if (e instanceof UnauthorizedException) {
            await handleUnauthorized();
        }
        return null;
    }
}