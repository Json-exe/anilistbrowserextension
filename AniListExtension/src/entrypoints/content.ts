import {defineContentScript} from "wxt/utils/define-content-script";
import {getUserToken, handleUnauthorized} from "@/lib/helper";
import {AnimeInfo, MessageData, RequestType, ResponseData} from "@/lib/interfaces";
import {execute, UnauthorizedException} from "@/graphql/executor";
import {SEARCH_MEDIA_CONTENT_QUERY} from "@/graphql/queries";
import {ContentScriptContext} from "wxt/utils/content-script-context";

export default defineContentScript({
    matches: ["https://*.crunchyroll.com/*"],
    runAt: "document_start",
    registration: "manifest",
    main(ctx) {
        console.log('Content script loaded and running!');
        init(ctx);
    },
});

function init(ctx: ContentScriptContext) {
    window.onload = async () => {
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
        ctx.onInvalidated(() => {
            observer.disconnect();
        });
    };

    window.addEventListener("load", async () => {
        if (!await checkAuth()) {
            return;
        }
        if (document.location.href.includes("series")) {
            setTimeout(() => getHeadingLineAndAddElementToIt(), 1500)
        }
    });
}

async function checkAuth() {
    const message: MessageData = {Type: RequestType.Auth}
    const response = await browser.runtime.sendMessage(message) as ResponseData;
    return response.success;
}

async function sendAnimeInfoToPopup(info?: AnimeInfo) {
    await browser.storage.local.set({AnimeInfo: info});
}

async function getHeadingLineAndAddElementToIt() {
    await new Promise(resolve => setTimeout(resolve, 100));
    const seriesHeroBody = document.evaluate("//div[@data-t='series-hero-body']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (!seriesHeroBody) return;
    const result = document.evaluate("//h1[contains(@class, 'hero-body__seo-title')]", seriesHeroBody, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    const title = result.singleNodeValue as HTMLHeadingElement;
    console.log(title.innerText)
    const data = await searchForAnime(title.innerText);
    console.log(data)
    if (!data) {
        await sendAnimeInfoToPopup();
        return;
    }
    await sendAnimeInfoToPopup(new AnimeInfo(
        data.id,
        data.title?.english ?? data.title?.romaji ?? title.innerText,
        data.siteUrl ?? '',
        data.mediaListEntry?.status ?? null,
        data.coverImage?.large ?? ''
    ));
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
        const isOnList = data.mediaListEntry !== null && data.mediaListEntry?.status !== null;
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
    seriesHeroBody.appendChild(info);
}

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