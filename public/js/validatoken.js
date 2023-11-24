document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "index.html";
    } else {
        const tokenData = parseJwt(token);

        if (tokenData && tokenData.exp && tokenData.exp * 1000 > Date.now()) {
        } else {
            window.location.href = "index.html";
        }
    }
});

function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace("-", "+").replace("_", "/");
        return JSON.parse(atob(base64));
    } catch (e) {
        return null;
    }
}

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");

    window.location.href = "index.html";
});
