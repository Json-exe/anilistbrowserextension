export interface MessageData {
    Type: RequestType
    Value?: any
}

export enum RequestType {
    Auth,
    AnimeInfo
}

export interface ResponseData {
    success: boolean
}

export class AnimeInfo {
    id: string
    title: string
    siteUrl: string
    mediaListEntry: any

    constructor(id: string, title: string, siteUrl: string, mediaListEntry: any) {
        this.id = id;
        this.title = title;
        this.siteUrl = siteUrl;
        this.mediaListEntry = mediaListEntry;
    }
}