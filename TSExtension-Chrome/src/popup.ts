import {AnimeInfo} from "./Interfaces";

document.addEventListener("DOMContentLoaded", async () => {
    const loginDiv = document.getElementById('login-div')!;
    const mainDiv = document.getElementById('main')!;
    const logout = mainDiv.querySelector('#logout')! as HTMLButtonElement;
    const confirmLogin = document.getElementById('confirm-login')!;
    const tokenInput = document.getElementById('token-input')! as HTMLInputElement;
    const notifyContainer = document.getElementById("notify-container")!;
    const notifyText = document.getElementById("notify-text")!;

    const token = await chrome.storage.local.get("UserToken") as { UserToken: string | undefined };
    if (token.UserToken === undefined || token.UserToken.length <= 50) {
        showElementAndChildren(loginDiv);
        mainDiv.style.display = 'none';
    } else {
        hideElementAndChildren(loginDiv);
        mainDiv.style.display = 'block';
    }

    logout.addEventListener('click', async () => {
        await chrome.storage.local.remove("UserToken");
        await chrome.storage.local.remove("UserId");
        showElementAndChildren(loginDiv);
        mainDiv.style.display = 'none';
    });

    confirmLogin.addEventListener('click', async () => {
        hideError()
        const token = tokenInput.value;
        if (token === undefined || token.length <= 50) {
            showError("The token was incorrect!")
            return;
        }
        await chrome.storage.local.set({UserToken: tokenInput.value});
        hideElementAndChildren(loginDiv);
        mainDiv.style.display = 'block';
    });

    function showError(text: string) {
        notifyContainer.classList.remove("visually-hidden")
        notifyText.textContent = text
    }

    function hideError() {
        notifyContainer.classList.add("visually-hidden")
        notifyText.textContent = ""
    }

    const animeInfo = await chrome.storage.local.get("AnimeInfo") as { AnimeInfo: AnimeInfo | undefined };
    if (animeInfo.AnimeInfo) {
        getAndUpdateInfoElements(animeInfo.AnimeInfo);
        showElementAndChildren(document.getElementById("anime-info"));
    }
});


function hideElementAndChildren(element: HTMLElement) {
    element.style.display = 'none';
    for (let i = 0; i < element.children.length; i++) {
        (element.children[i] as HTMLElement).style.display = 'none';
    }
}

function showElementAndChildren(element: HTMLElement) {
    element.style.display = 'block';
    for (let i = 0; i < element.children.length; i++) {
        (element.children[i] as HTMLElement).style.display = 'block';
    }
}

function getAndUpdateInfoElements(info: AnimeInfo) {
    const titleElement = document.getElementById("anime-info-name")!;
    const statusElement = document.getElementById("anime-info-status")!;
    const imageElement = document.getElementById("anime-info-image")! as HTMLImageElement;
    const linkElement = document.getElementById("anime-info-list-link")! as HTMLAnchorElement;
    const noContentElement = document.getElementById("no-content");
    noContentElement.style.display = "none";
    titleElement.textContent = info.title;
    statusElement.textContent = "Status: " + info.mediaListStatus;
    linkElement.href = info.siteUrl;
    imageElement.src = info.image ?? "https://anilist.co/img/icons/icon.svg";
}