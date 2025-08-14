import type {TypedDocumentString} from "@/__generated__/graphql";


export async function execute<TResult, TVariables>(
    query: TypedDocumentString<TResult, TVariables>,
    variables?: TVariables,
    additionalHeaders?: Record<string, string>
) {
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/graphql-response+json',
        ...additionalHeaders
    };

    const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            query,
            variables
        })
    });

    if (!response.ok) {
        switch (response.status) {
            case 401 | 400:
                throw new UnauthorizedException();
        }
        throw new Error('Network response was not ok');
    }

    return (await response.json()).data as TResult;
}

// Add new UnauthorizedException class
export class UnauthorizedException extends Error {
    constructor() {
        super("Unauthorized");
    }
}