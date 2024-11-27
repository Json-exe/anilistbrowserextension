import {graphql} from "../__generated__";

export const GET_USER_QUERY = graphql(`
    query GetUser{
        Viewer {
            id
            name
        }
    }
`)

export const SEARCH_MEDIA_QUERY = graphql(`
    query SearchMedia($id: Int, $search: String) { # Define which variables will be used in the query (id)
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
`)

export const ADD_MEDIA_TO_LIST_MUTATION = graphql(`
    mutation AddMediaToList($mediaId: Int) {
        SaveMediaListEntry(mediaId: $mediaId, status: PLANNING) {
            id
            status
        }
    }
`)