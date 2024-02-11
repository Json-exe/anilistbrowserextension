document.addEventListener("DOMContentLoaded", async () => {
    const loginDiv = document.getElementById('login-div')!;
    const reauthButton = document.getElementById('reauthenticate')!;
    const confirmLogin = document.getElementById('confirm-login')!;
    const tokenInput = document.getElementById('token-input')! as HTMLInputElement;

    const token = await browser.storage.local.get("UserToken") as { UserToken: string | undefined };
    if (token.UserToken === undefined || token.UserToken.length <= 50) {
        showElementAndChildren(loginDiv);
        reauthButton.style.display = 'none';
    } else {
        hideElementAndChildren(loginDiv);
        reauthButton.style.display = 'block';
    }

    reauthButton.addEventListener('click', async () => {
        await browser.storage.local.remove("UserToken");
        await browser.storage.local.remove("UserId");
        showElementAndChildren(loginDiv);
        reauthButton.style.display = 'none';
    });

    confirmLogin.addEventListener('click', async () => {
        const token = tokenInput.value;
        if (token === undefined || token.length <= 50) {
            return;
        }
        await browser.storage.local.set({ UserToken: tokenInput.value });
        hideElementAndChildren(loginDiv);
        reauthButton.style.display = 'block';
    });
});

function hideElementAndChildren(element: HTMLElement) {
    element.style.display = 'none';
    for (let i = 0; i < element.children.length; i++) {
        (element.children[i] as HTMLElement).style.display = 'none';
    }
}

function showElementAndChildren(element: HTMLElement) {
    element.style.display = 'block';
    for (let i = 0; i < element.children.length; i++) {
        (element.children[i] as HTMLElement).style.display = 'block';
    }
}