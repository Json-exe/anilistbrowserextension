export interface MessageData {
    Type: RequestType
}

export enum RequestType {
    Auth
}

export interface ResponseData {
    success: boolean
}