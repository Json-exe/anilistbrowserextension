export const getUserQuery = `query {
    Viewer {
        id
        name
    }
}
`

export const searchMedia = `query ($id: Int, $search: String) { # Define which variables will be used in the query (id)
    Media (id: $id, type: ANIME, search: $search) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
        id
        title {
            romaji
            english
        }
        mediaListEntry {
            id
            status
        },
        siteUrl
    }
}
`

export const addMediaToList = `mutation ($mediaId: Int) {
    SaveMediaListEntry(mediaId: $mediaId, status: PLANNING) {
        id
        status
    }
}
`