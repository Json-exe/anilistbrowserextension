import {defineConfig} from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: 'src',
    modules: ['@wxt-dev/module-svelte', '@wxt-dev/auto-icons'],
    manifest: {
        permissions: [
            'storage',
            "contextMenus",
            "notifications",
            "scripting",
            "webNavigation"
        ],
        name: "AniList Crunchyroll Companion",
    }
});
