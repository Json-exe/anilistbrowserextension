import {searchMedia} from './graphql/graphqlQuerys'
import {checkIfAuthenticated, getUserToken, handleUnauthorized} from "./anilistextensionhelpers";

const url = "https://graphql.anilist.co";


const observerUrlChange = async () => {
    if (!await checkIfAuthenticated()) {
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
    if (data) {
        const isOnList = data.mediaListEntry !== null;
        const info = document.createElement("div");
        const link = document.createElement("a");
        info.className = "new-element-class";
        info.style.border = "1px solid blue";
        info.style.borderRadius = "24px";
        info.style.padding = "7px";
        link.href = data.siteUrl ?? "";
        link.target = "_blank";
        link.style.fontWeight = "bold";
        link.style.textDecoration = "underline";
        if (isOnList) {
            link.text = "Already On List!";
        } else {
            link.text = "Not on List!";
        }
        info.appendChild(link);
        result.appendChild(info);
    }
}

window.onload = observerUrlChange;
window.addEventListener("load", async (e) => {
    if (!await checkIfAuthenticated()) {
        return;
    }
    if (document.location.href.includes("series")) {
        setTimeout(() => getHeadingLineAndAddElementToIt(), 1500)
    }
})

async function searchForAnime(searchText: string) {
    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + await getUserToken(),
        },
        body: JSON.stringify({
            query: searchMedia,
            variables: {
                search: searchText
            }
        })
    } as RequestInit;

    const response = await fetch(url, options)
    if (response.status === 400 || response.status === 401) {
        await handleUnauthorized()
        return;
    } else if (!response.ok) {
        return;
    }
    const data = await response.json();
    return data.data.Media;
}