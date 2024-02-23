const observerUrlChange = () => {
    let old = document.location.href;
    const observer = new MutationObserver(mutations => {
        if (old !== document.location.href) {
            old = document.location.href;
            if (old.includes("series")) {
                getHeadingLineAndAddElementToIt();
            }
        }
    })
    observer.observe(document.body, { childList: true, subtree: true })
}

function getHeadingLineAndAddElementToIt() {
    console.log("Getting element!")
    let result = document.getElementsByClassName("app-body-wrapper")[0].getElementsByClassName("body")[0].children[0];
    console.log(result);
    const info = document.createElement("div");
    info.textContent = "On List!";
    info.className = "new-element-class";
    result.appendChild(info);
}

window.onload = observerUrlChange;
document.addEventListener("load", (e) => {
    if (document.location.href.includes("series")) {
        getHeadingLineAndAddElementToIt();
    }
})