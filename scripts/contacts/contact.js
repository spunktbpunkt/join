let fireBaseContent = {};
let chosenCard = 0;
let chosen = false;


/**
 * Asynchronously loads data from Firebase and assigns it to the global variable `fireBaseContent`.
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the data has been loaded and assigned.
 */
async function loadFromFirebase() {
  fireBaseContent = await loadData();
}


/**
 * Initializes the contacts page by loading data from Firebase,
 * populating user links, retrieving contacts, auto-selecting items,
 * and sending data to an iframe.
 *
 * @async
 * @function onloadContacts
 * @returns {Promise<void>} Resolves when all initialization steps are complete.
 */
async function onloadContacts() {
  await loadFromFirebase();
  fillUserLinks();
  getContactsFromFirebase();
  autoSelect();
  sendDataToIframe();
  addHelpToPopup();
  getCurrentHTML();
}


/**
 * Sends data to the iframe with the ID "editContact" using the postMessage API.
 * The message includes firebase data, a token, and results.
 *
 * @function
 * @returns {void}
 */
function sendDataToIframe() {
  const iframe = document.getElementById("editContact");
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage({
      type: "firebaseData",
      data: fireBaseContent,
      token: thisToken,
      ergebnisse
    }, "*");
  }
}


/**
 * Fetches contact and login data from the global `fireBaseContent` object,
 * merges them, sorts users alphabetically by name, groups them by the first letter
 * of their names, and renders the grouped contacts into the DOM element with the ID "allContacts".
 *
 * Assumes the existence of helper functions `createGroupDiv` and `createSingleUserNav`.
 *
 * @function
 * @returns {void}
 */
function getContactsFromFirebase() {
  const data = { ...fireBaseContent.contact, ...fireBaseContent.login };
  const users = Object.values(data)
    .map(u => ({ name: u.name, email: u.email, color: u.color, phone: u.phone }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  const grouped = users.reduce((g, u) => {
    const l = u.name[0]?.toUpperCase() || "#";
    (g[l] ||= []).push(u);
    return g;
  }, {});
  const c = document.getElementById("allContacts");
  c.innerHTML = "";
  let n = 0;
  Object.keys(grouped).sort().forEach(l => {
    const d = createGroupDiv(l);
    grouped[l].forEach(u => d.appendChild(createSingleUserNav(u, ++n)));
    c.appendChild(d);
  });
}


/**
 * Creates a group container div element for a given letter, including a styled span and separator.
 *
 * @param {string} letter - The letter to display in the group header.
 * @returns {HTMLDivElement} The constructed group div element containing the letter and a separator.
 */
function createGroupDiv(letter) {
  const div = document.createElement("div");
  div.id = `capital${letter}`;
  div.classList.add("capital");

  const span = document.createElement("span");
  span.textContent = letter;
  span.classList.add("spanLetter");
  div.appendChild(span);

  const sep = document.createElement("div");
  sep.classList.add("separator");
  div.appendChild(sep);

  return div;
}


/**
 * Creates a navigation element representing a single user with their initials, name, and email.
 *
 * @param {Object} user - The user object containing user details.
 * @param {string} user.name - The full name of the user.
 * @param {string} user.email - The email address of the user.
 * @param {string} [user.color] - Optional color code for the user's initials background.
 * @param {number|string} userNumber - A unique identifier or index for the user, used for element IDs.
 * @returns {HTMLElement} The constructed navigation element for the user.
 */
function createSingleUserNav(user, userNumber) {
  const nav = document.createElement("nav");
  nav.id = `singleUser${userNumber}`;
  nav.classList.add("singleUser");

  const initials = document.createElement("span");
  initials.className = `userInitials ${user.color ? "userColor-" + user.color.replace("#", "") : "userColor-default"}`;
  initials.textContent = getInitials(user.name);
  nav.appendChild(initials);

  const details = document.createElement("div");
  details.classList.add("userDetails");

  details.innerHTML = `<span class="userName">${user.name}</span>
    <a id="singleUserMail${userNumber}" href="mailto:${user.email}" class="emailText">${user.email}</a>`;
  nav.appendChild(details);

  nav.addEventListener("click", () => chooseTaskDetails(nav.id));
  return nav;
}


/**
 * Handles the selection and display of task details for a contact element.
 * Determines the action to take based on whether a contact is already chosen,
 * if the same contact is chosen again, or if a different contact is selected.
 *
 * @param {string} elementId - The DOM element ID of the contact to select.
 */
function chooseTaskDetails(elementId) {
  const thenum = elementId.match(/\d+/)[0];
  let caseKey = !chosen
    ? "not-chosen"
    : chosenCard !== thenum
      ? "chosen-different"
      : "chosen-same";

  switch (caseKey) {
    case "chosen-different":
      hideDetails(`singleUser${chosenCard}`);
      contactDetails(elementId, thenum);
      break;
    case "not-chosen":
      contactDetails(elementId, thenum);
      break;
    case "chosen-same":
      hideDetails(`singleUser${chosenCard}`);
      break;
  }
}


/**
 * Displays the details of a selected contact and updates the UI accordingly.
 *
 * @async
 * @param {string} elementId - The ID of the DOM element representing the contact card.
 * @param {number} thenum - The unique number/index associated with the contact.
 * @returns {Promise<void>} Resolves when the contact details have been displayed and UI updated.
 */
async function contactDetails(elementId, thenum) {
  responsiveContentRight('show');
  chosenCard = thenum;

  const email = document.getElementById(`singleUserMail${thenum}`)?.innerText;
  if (!email) return console.error(`Email element singleUserMail${thenum} not found.`);

  localStorage.setItem('selectedContactEmail', email);
  const detail = await getContactDetails(email);
  if (!detail) return console.error(`Details for ${email} not found.`);

  updateContactUI(elementId, detail);
  thisToken = await findUser(detail.email);
  chosen = true;
}

function updateContactUI(elementId, detail) {
  const nav = document.getElementById(elementId);
  if (nav && window.innerWidth >= 800) nav.classList.replace("singleUser", "singleUserChosen");

  const el = id => document.getElementById(id);
  el("contactDetails")?.classList.remove("hide");
  el("contactDetailsInitials") && Object.assign(el("contactDetailsInitials"), {
    className: `userInitialsBig userColor-${detail.color.replace("#", "")}`,
    innerText: getInitials(detail.name)
  });
  if (el("contactDetailsName")) el("contactDetailsName").innerText = detail.name;
  if (el("contactDetailsMail")) {
    el("contactDetailsMail").innerText = detail.email;
    el("contactDetailsMail").href = `mailto:${detail.email}`;
  }
  if (el("contactDetailsPhone")) el("contactDetailsPhone").innerText = detail.phone;
  el("deleteError")?.classList.add("hide");
}


function clearErrors(){
  hideError("","editErrorSpan")
  hideError("","deleteErrorSpan")
}

function responsiveContentRight(task) {
  clearErrors();
  const ids = ["contentRight", "allContacts", "contentLeft", "backToList", "addContactResponsiv", "editContactResponsiv"];
  const elems = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
  const show = task === 'show' && window.innerWidth <= 800;

  if (show) {
    toggleClasses(elems, [
      ["contentRight", "showContentRight", true],
      ["allContacts", "width0", true],
      ["contentLeft", "width0", true],
      ["backToList", "displayNone", false],
      ["addContactResponsiv", "visibleNone", true],
      ["editContactResponsiv", "visibleNone", false],
    ]);
  } else {
    toggleClasses(elems, [
      ["contentRight", "showContentRight", false],
      ["allContacts", "width0", false],
      ["contentLeft", "width0", false],
      ["backToList", "displayNone", true],
      ["addContactResponsiv", "visibleNone", false],
      ["editContactResponsiv", "visibleNone", true],
    ]);
    document.getElementById("deleteError")?.classList.add("hide");
    changeImage("addContactResponsivImg", "person_add");
  }
}

function toggleClasses(elems, actions) {
  actions.forEach(([id, cls, add]) =>
    elems[id]?.classList[add ? "add" : "remove"](cls)
  );
}




/**
 * Hides the contact details and resets the selected user state.
 *
 * @param {string} elementId - The ID of the element representing the selected user.
 */
function hideDetails(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.replace("singleUserChosen", "singleUser");
  } else {
    console.error(`Element with ID ${elementId} not found.`);
  }

  const contactDetails = document.getElementById("contactDetails");
  if (contactDetails) {
    contactDetails.classList.add("hide");
  } else {
    console.error("Contact details element not found.");
  }

  const deleteError = document.getElementById("deleteError");
  if (deleteError) {
    deleteError.classList.add("hide");
  } else {
    console.error("Delete error element not found.");
  }

  chosen = false;
}


/**
 * Automatically selects and scrolls to the last edited contact in the contact list.
 * Retrieves the last edited contact's identifier from localStorage, finds the corresponding
 * contact link in the DOM, selects its details, and scrolls it into view. Finally, removes
 * the 'lastEditedContact' entry from localStorage.
 *
 * Assumes that contact links have the class 'emailText' and are contained within a parent
 * element with the ID 'allContacts'. Also assumes that each contact link is inside a <nav>
 * element whose ID can be used with chooseTaskDetails.
 */
function autoSelect() {
  const last = localStorage.getItem('lastEditedContact');
  if (!last) return;

  const link = Array.from(document.querySelectorAll('#allContacts a.emailText'))
    .find(a => a.innerText === last);

  if (link) {
    const nav = link.closest('nav');
    chooseTaskDetails(nav.id);
    setTimeout(() => nav.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
  }

  localStorage.removeItem('lastEditedContact');
}


/**
 * Displays an error message tooltip near a specified element when attempting to edit or delete other registered users.
 *
 * @param {string} type - The ID of the element triggering the error (e.g., "editIcon" or another identifier).
 * @param {number} offsetX - The horizontal offset in pixels to position the error message relative to the element.
 * @param {number} offsetY - The vertical offset in pixels (currently unused, as top is hardcoded).
 */
function deleteErrorContact(type, offsetX, offsetY) {
  try {
    const el = document.getElementById(type);
    const pos = el.getBoundingClientRect();
    const span = document.getElementById("deleteError");
    span.innerHTML = type === "editIcon"
      ? `You can't edit<br>other registered users`
      : `You can't delete<br>other registered users`;
    span.classList.remove("hide");
    span.style.left = `${Math.round(pos.left + offsetX)}px`;
    span.style.top = `${Math.round(pos.top + offsetY)}px`;
  } catch {
    /* ignore */
  }
}


/**
 * Retrieves the contact details for a user with the specified email address.
 *
 * Attempts to access contact and login data from `fireBaseContent`. If unavailable, it loads the data asynchronously.
 * Searches for a user whose email matches the provided `emailToFind` and returns their details.
 * If no matching user is found, returns a default object with empty fields and a default color.
 *
 * @async
 * @param {string} emailToFind - The email address of the user to find.
 * @returns {Promise<{name: string, email: string, phone: string, color: string}>} 
 *          An object containing the user's name, email, phone, and color. Returns default values if not found.
 */
async function getContactDetails(emailToFind) {
  let dataLogin, dataContact;
  try {
    dataLogin = fireBaseContent.login;
    dataContact = fireBaseContent.contact;
  } catch {
    dataLogin = await loadData("login");
    dataContact = await loadData("contact");
  }
  const dataFull = { ...dataContact, ...dataLogin };

  for (const [, u] of Object.entries(dataFull)) {
    if (u.email === emailToFind) {
      return { name: u.name, email: u.email, phone: u.phone, color: u.color };
    }
  }
  return { name: "", email: "", phone: "", color: "#cccccc" };
}


/**
 * Shows or hides the cancel button ("leftBtn") based on the window's width.
 * If the window width is less than 800 pixels, hides the button and adjusts the right button's margin.
 * If the window width is 800 pixels or more, shows the button.
 * Handles errors gracefully if elements are not found.
 */
function hideCancelBtn() {
  let task = this.window.innerWidth < 800 ? 'hide' : 'show';

  try {
    if (task == 'show') {
      document.getElementById("leftBtn").classList.remove('hide')
    } else {
      document.getElementById("leftBtn").classList.add('hide')
      document.getElementById("rightBtn").style('margin-right: 0;')
    }
  } catch (error) {
    return
  }
}


/**
 * Checks if the element with the ID "deleteError" is visible and if the window width is less than 400 pixels.
 * Intended to handle UI changes for the error button based on visibility and screen size.
 */
function moveErrorBtn(){
  let visibleCheck = document.getElementById("deleteError").classList.contains("visible")
  if(visibleCheck && window.innerWidth < 400){

  }
}


function ensureDeleteErrorExists() {
  let deleteError = document.getElementById("deleteError");
  if (!deleteError) {
    deleteError = document.createElement("span");
    deleteError.id = "deleteError";
    deleteError.classList.add("hide");
    document.body.appendChild(deleteError);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  ensureDeleteErrorExists();
});


window.addEventListener("DOMContentLoaded", onloadContacts);
