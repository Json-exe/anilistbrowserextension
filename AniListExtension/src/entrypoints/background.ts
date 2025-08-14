import {searchAnimeAndCheckIfOnList} from "@/lib/main";
import {defineBackground} from "wxt/utils/define-background";

export default defineBackground(() => {
    console.log('Hello background!', {id: browser.runtime.id});

    browser.runtime.onInstalled.addListener(function () {
        browser.contextMenus.create({
            id: "add-anime",
            title: "Add anime to Watchlist",
            type: "normal",
            documentUrlPatterns: ["*://*.crunchyroll.com/*"],
            contexts: ["selection"],
        })
    })

    browser.contextMenus.onClicked.addListener(async function (info) {
        switch (info.menuItemId) {
            case "add-anime":
                await searchAnimeAndCheckIfOnList(info.selectionText);
                break;
        }
    })
});
