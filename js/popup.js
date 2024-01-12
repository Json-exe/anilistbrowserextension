document.addEventListener('DOMContentLoaded', function() {
    const loginDiv = document.getElementById('login-div');
    const reauthButton = document.getElementById('reauthenticate');
    const confirmLogin = document.getElementById('confirm-login');
    const tokenInput = document.getElementById('token-input');

    browser.storage.local.get('UserToken', function (data) {
        if (data.UserToken) {
            hideElementAndChildren(loginDiv)
            reauthButton.style.display = 'block';
        } else {
            showElementAndChildren(loginDiv);
            reauthButton.style.display = 'none';
        }
    })

    reauthButton.addEventListener('click', function() {
        browser.storage.local.remove('UserToken');
        browser.storage.local.remove('UserId');
        showElementAndChildren(loginDiv);
        reauthButton.style.display = 'none';
    });

    confirmLogin.addEventListener('click', function() {
        const token = tokenInput.value;
        if (token && token.length > 50) {
            browser.storage.local.set({UserToken: token}).then(setItem, onError);
            hideElementAndChildren(loginDiv)
            reauthButton.style.display = 'block';
        } else {
            Toastify({
                text: "Please check your input!",
                duration: 3000,
                position: "right",
                gravity: "bottom",
                close: true,
            }).showToast();
        }
    });
});

function setItem() {
    console.log("OK");
}

function onError(error) {
    console.log(error);
}

function hideElementAndChildren(element) {
    element.style.display = 'none';
    for (let i = 0; i < element.children.length; i++) {
        element.children[i].style.display = 'none';
    }
}

function showElementAndChildren(element) {
    element.style.display = 'block';
    for (let i = 0; i < element.children.length; i++) {
        element.children[i].style.display = 'block';
    }
}