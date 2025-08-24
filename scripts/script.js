let ergebnisse = "";
let thisToken = "";
let nameInput = document.getElementById('nameInput');
let emailInput = document.getElementById('emailInput');
let passwordInput = document.getElementById('passwordInput')
let confirmInput = document.getElementById('confirmPasswordInput')

/**
 * writes and saves data to local storage
 */
async function writeLocalStorage() {
    let myEmail = await findUser(document.getElementById("emailInput").value);
    let email = document.getElementById("emailInput").value;

    localStorage.setItem("name", email)
    localStorage.setItem("token", myEmail)
}

/**
 * finds the name of the user that is being loaded
 * 
 * @param {String} name 
 */
async function findName(name) {
    let ergebnisse = await loadData("login")
    for (let userId in ergebnisse) {
        if (ergebnisse[userId].name === name) {
            return userId;
        }
    }
    return null;
}

/**
 * finds the user in the database based on the email
 * 
 * @param {String} email
 */
async function findUser(email) {
    email = email.toLowerCase()
    let ergebnisseLogin = ""
    let ergebnisseContacts = ""

    try {
        ergebnisseLogin = fireBaseContent.login;
        ergebnisseContacts = fireBaseContent.contact;
    } catch (error) {
        ergebnisseLogin = await loadData("login")
        ergebnisseContacts = await loadData("contact")
    }

    ergebnisse = { ...ergebnisseLogin, ...ergebnisseContacts }
    for (let userId in ergebnisse) {
        if (ergebnisse[userId].email === email) {
            return userId;
        }
    }
    return null;
}

/**
 * logs out the current user and deletes data saves in local storage
 */
function logout() {
    localStorage.setItem("user", "")
    localStorage.setItem("token", "")
    window.location = '../index.html';
}

/**
 * displays a popup at target location
 * 
 * @param {HTMLElement} element 
 * @param {HTMLElement} target 
 */
function toasterPopup(element, target) {
    let mySpan = document.getElementById(element);
    mySpan.classList.remove("displayNone");
    setTimeout(() => {
        mySpan.style.top = '50%'; mySpan.style.transform = 'translate(-50%, -50%)';
    }, 500)

    setTimeout(() => {
        window.location = `${target}.html`;

    }, 2000)
}

/**
 * adds the popup to the site based on window dimensions
 */
function addHelpToPopup() {
    const windowWidth = window.innerWidth;
    try {
        if (windowWidth <= 800) {
            document.getElementById("userLinkOptions").innerHTML = `
        <a href="../html/help.html" class="userLinkOptionsLinks">Help</a>
        <a href="../html/legalNotice.html" class="userLinkOptionsLinks">Legal Notice</a>
        <a href="../html/privacyPolicy.html" class="userLinkOptionsLinks">Privacy Policy</a>
        <a onclick="logout()" class="userLinkOptionsLinks">Log out</a>
        `
        } else {
            document.getElementById("userLinkOptions").innerHTML = `
        <a href="../html/legalNotice.html" class="userLinkOptionsLinks">Legal Notice</a>
        <a href="../html/privacyPolicy.html" class="userLinkOptionsLinks">Privacy Policy</a>
        <a onclick="logout()" class="userLinkOptionsLinks">Log out</a>
        `
        }
    } catch (error) {

    }
}

/**
 * gets the current url path and modifies it
 */
function getCurrentHTML() {
    let path = window.location.pathname;
    let page = path.split("/").pop();
    const nav = document.getElementById('linkNav');

    if (nav) {
        const links = nav.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            const img = link.querySelector('img');

            if (link.href.search(page) > 0) {
                link.classList.add("active")
                img.src = img.getAttribute('src').replace('gray', 'white')
            } else {
                link.classList.remove("active")
                img.src = img.getAttribute('src').replace('white', 'gray')
            }
        });
    }
}


function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

