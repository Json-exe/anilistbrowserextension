/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
    "\n    query GetUser{\n        Viewer {\n            id\n            name\n        }\n    }\n": types.GetUserDocument,
    "\n    query SearchMedia($id: Int, $search: String) { # Define which variables will be used in the query (id)\n        Media (id: $id, type: ANIME, search: $search) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)\n            id\n            title {\n                romaji\n                english\n            }\n            mediaListEntry {\n                id\n                status\n            },\n            siteUrl\n        }\n    }\n": types.SearchMediaDocument,
    "\n    query SearchMediaContent($id: Int, $search: String) {\n        Media (id: $id, type: ANIME, search: $search) {\n            id\n            title {\n                romaji\n                english\n            }\n            mediaListEntry {\n                id\n                status\n            },\n            siteUrl,\n            coverImage {\n                medium\n            }\n        }\n    }\n": types.SearchMediaContentDocument,
    "\n    mutation AddMediaToList($mediaId: Int) {\n        SaveMediaListEntry(mediaId: $mediaId, status: PLANNING) {\n            id\n            status\n        }\n    }\n": types.AddMediaToListDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetUser{\n        Viewer {\n            id\n            name\n        }\n    }\n"): typeof import('./graphql').GetUserDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SearchMedia($id: Int, $search: String) { # Define which variables will be used in the query (id)\n        Media (id: $id, type: ANIME, search: $search) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)\n            id\n            title {\n                romaji\n                english\n            }\n            mediaListEntry {\n                id\n                status\n            },\n            siteUrl\n        }\n    }\n"): typeof import('./graphql').SearchMediaDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SearchMediaContent($id: Int, $search: String) {\n        Media (id: $id, type: ANIME, search: $search) {\n            id\n            title {\n                romaji\n                english\n            }\n            mediaListEntry {\n                id\n                status\n            },\n            siteUrl,\n            coverImage {\n                medium\n            }\n        }\n    }\n"): typeof import('./graphql').SearchMediaContentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AddMediaToList($mediaId: Int) {\n        SaveMediaListEntry(mediaId: $mediaId, status: PLANNING) {\n            id\n            status\n        }\n    }\n"): typeof import('./graphql').AddMediaToListDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
