let dataLogin = "";
let dataContact = "";
let dataFull = "";
let userNumber = 0;
let groupedUsers = {};

/**
 * Fetches contact and login data from Firebase, merges them, sorts the users,
 * groups them alphabetically, and renders the grouped contact list in the navigation UI.
 * 
 * Side Effects:
 * - Modifies global variables: `userNumber`, `groupedUsers`, `dataLogin`, `dataContact`, `dataFull`.
 * - Updates the DOM element with id "allContacts" by clearing its content and appending grouped user elements.
 * 
 * Dependencies:
 * - Assumes existence of `fireBaseContent` object with `login` and `contact` properties.
 * - Relies on helper functions: `sortUsers()`, `createGroupDiv(letter)`, and `createSingleUserNav(user, userNumber)`.
 */
function getContactsFromFirebase() {
    userNumber = 0;
    groupedUsers = {};

    dataLogin = fireBaseContent.login;
    dataContact = fireBaseContent.contact;
    dataFull = { ...dataContact, ...dataLogin };

    sortUsers();
    renderGroupedUsers();
}

function renderGroupedUsers() {
    const allContactsNav = document.getElementById("allContacts");
    allContactsNav.innerHTML = "";

    Object.keys(groupedUsers).forEach(letter => {
        const groupDiv = createGroupDiv(letter);
        groupedUsers[letter].forEach(user => {
            userNumber++;
            const userNav = createSingleUserNav(user, userNumber);
            groupDiv.appendChild(userNav);
        });
        allContactsNav.appendChild(groupDiv);
    });
}


/**
 * Sorts users from the global `dataFull` object alphabetically by their first name,
 * then groups them into the global `groupedUsers` object by the first letter of their name.
 * Each user object contains `name`, `email`, `color`, and `phone` properties.
 *
 * @global
 * @function
 * @returns {void}
 */
function sortUsers() {
    const users = Object.values(dataFull).map(user => ({
        name: user.name,
        email: user.email,
        color: user.color,
        phone: user.phone
    }));

    users.sort((a, b) => {
        const firstNameA = a.name.split(" ")[0].toLowerCase();
        const firstNameB = b.name.split(" ")[0].toLowerCase();
        return firstNameA.localeCompare(firstNameB);
    });

    groupUsersByFirstLetter(users);
}

function groupUsersByFirstLetter(users) {
    groupedUsers = {};
    users.forEach(user => {
        const firstLetter = user.name[0].toUpperCase();
        if (!groupedUsers[firstLetter]) {
            groupedUsers[firstLetter] = [];
        }
        groupedUsers[firstLetter].push(user);
    });
}


/**
 * Creates a group container div element for a given letter, including a styled letter span and a separator.
 *
 * @param {string} letter - The letter to display in the group header.
 * @returns {HTMLDivElement} The constructed group div element containing the letter and a separator.
 */
function createGroupDiv(letter) {
    const div = document.createElement("div");
    div.id = `capital${letter}`;
    div.classList.add("capital");

    const spanLetter = document.createElement("span");
    spanLetter.textContent = letter;
    spanLetter.classList.add("spanLetter");
    div.appendChild(spanLetter);

    const separator = document.createElement("div");
    separator.classList.add("separator");
    div.appendChild(separator);

    return div;
}

/**
 * Creates a navigation element representing a single user, including their initials and details.
 * Appends click event handlers for user interaction.
 *
 * @param {Object} user - The user object containing user information.
 * @param {number} userNumber - The unique number or index for the user.
 * @returns {HTMLElement} The constructed navigation element for the user.
 */
function createSingleUserNav(user, userNumber) {
    const nav = document.createElement("nav");
    nav.id = `singleUser${userNumber}`;
    nav.classList.add("singleUser");

    const initials = createUserInitials(user);
    const details = createUserDetails(user, userNumber);

    nav.appendChild(initials);
    nav.appendChild(details);
    addUserClickHandler(nav);

    return nav;
}


/**
 * Creates a span element containing the user's initials with appropriate styling.
 *
 * @param {Object} user - The user object containing user information.
 * @param {string} user.name - The full name of the user.
 * @param {string} [user.color] - Optional hex color code for the user's initials background.
 * @returns {HTMLSpanElement} The span element with the user's initials and color class.
 */
function createUserInitials(user) {
    const initials = document.createElement("span");
    initials.classList.add("userInitials");

    const colorClass = user.color
        ? `userColor-${user.color.replace('#', '')}`
        : "userColor-default";
    initials.classList.add(colorClass);

    initials.textContent = getInitials(user.name);
    return initials;
}


/**
 * Creates a DOM element containing user details including name and email.
 *
 * @param {Object} user - The user object containing user information.
 * @param {string} user.name - The name of the user.
 * @param {string} user.email - The email address of the user.
 * @param {number} userNumber - A unique number used to generate the email element's ID.
 * @returns {HTMLDivElement} The DOM element containing the user's details.
 */
function createUserDetails(user, userNumber) {
    const userDetails = document.createElement("div");
    userDetails.classList.add("userDetails");

    const userName = document.createElement("span");
    userName.classList.add("userName");
    userName.textContent = user.name;

    const userEmail = document.createElement("a");
    userEmail.id = `singleUserMail${userNumber}`;
    userEmail.href = `mailto:${user.email}`;
    userEmail.classList.add("emailText");
    userEmail.textContent = user.email;

    userDetails.appendChild(userName);
    userDetails.appendChild(userEmail);
    return userDetails;
}


/**
 * Attaches a click event listener to the given navigation element.
 * When clicked, it calls the chooseTaskDetails function with the element's id.
 *
 * @param {HTMLElement} navElement - The navigation element to attach the click handler to.
 */
function addUserClickHandler(navElement) {
    navElement.addEventListener("click", () => {
        // contactDetails(navElement.id);
        chooseTaskDetails(navElement.id);
    });
}