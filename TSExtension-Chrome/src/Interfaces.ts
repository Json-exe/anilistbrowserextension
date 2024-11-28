import {MediaListStatus} from "./__generated__/graphql";

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
    id: number
    title: string
    siteUrl: string
    mediaListStatus?: MediaListStatus
    image?: string

    constructor(id: number, title: string, siteUrl: string, mediaListStatus?: MediaListStatus, image?: string) {
        this.id = id;
        this.title = title;
        this.siteUrl = siteUrl;
        this.mediaListStatus = mediaListStatus;
        this.image = image;
    }
}