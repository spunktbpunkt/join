/**
 * Checks if a user is stored in localStorage under the key "name".
 * If no user is found, redirects the browser to the index page.
 */
function checkLocalstorage() {
    const user = localStorage.getItem("name");
    
    if (!user) {
        window.location.href = "/index.html";
    }
}

checkLocalstorage();