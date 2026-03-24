export type NotificationActionDto = {
    type: "open-url";
    url: string;
};

const actions: Map<string, NotificationActionDto> = new Map();
let initialized = false;

export function initNotificationActionExecutor() {
    if (initialized) {
        return;
    }

    browser.notifications.onClicked.addListener((notificationId) => {
        const action = actions.get(notificationId);
        if (!action) {
            return;
        }

        switch (action.type) {
            case "open-url":
                browser.tabs.create({url: action.url});
                break;
        }

        actions.delete(notificationId);
    });

    browser.notifications.onClosed.addListener((notificationId) => {
        actions.delete(notificationId);
    });

    initialized = true;
}

export function registerNotificationAction(notificationId: string, action: NotificationActionDto) {
    actions.set(notificationId, action);
}

export function createOpenUrlNotificationAction(url: string): NotificationActionDto {
    return {
        type: "open-url",
        url,
    };
}