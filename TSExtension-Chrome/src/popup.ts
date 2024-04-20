document.addEventListener("DOMContentLoaded", async () => {
    const loginDiv = document.getElementById('login-div')!;
    const reauthDiv = document.getElementById('reauthenticate')!;
    const confirmLogin = document.getElementById('confirm-login')!;
    const tokenInput = document.getElementById('token-input')! as HTMLInputElement;
    const notifyContainer = document.getElementById("notify-container")!;
    const notifyText = document.getElementById("notify-text")!;

    const token = await chrome.storage.local.get("UserToken") as { UserToken: string | undefined };
    if (token.UserToken === undefined || token.UserToken.length <= 50) {
        showElementAndChildren(loginDiv);
        reauthDiv.style.display = 'none';
    } else {
        hideElementAndChildren(loginDiv);
        reauthDiv.style.display = 'block';
    }

    reauthDiv.addEventListener('click', async () => {
        await chrome.storage.local.remove("UserToken");
        await chrome.storage.local.remove("UserId");
        showElementAndChildren(loginDiv);
        reauthDiv.style.display = 'none';
    });

    confirmLogin.addEventListener('click', async () => {
        hideError()
        const token = tokenInput.value;
        if (token === undefined || token.length <= 50) {
            showError("The token was incorrect!")
            return;
        }
        await chrome.storage.local.set({ UserToken: tokenInput.value });
        hideElementAndChildren(loginDiv);
        reauthDiv.style.display = 'block';
    });

    function showError(text: string) {
        notifyContainer.classList.remove("visually-hidden")
        notifyText.textContent = text
    }

    function hideError() {
        notifyContainer.classList.add("visually-hidden")
        notifyText.textContent = ""
    }
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