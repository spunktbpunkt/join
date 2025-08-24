let setOffs = window.innerWidth < 400 ? ["deleteIcon", 4, 30] : ["editIcon", 4, 30];


/**
 * Displays the contact form in the specified mode (e.g., 'add' or 'edit').
 * Renders the form template, sets up the form state, and updates the UI accordingly.
 * 
 * @async
 * @param {string} mode - The mode in which to show the contact form ('add', 'edit', etc.).
 * @returns {Promise<void>} Resolves when the form is shown and initialized.
 */
async function showContactForm(mode) {
  renderFormBackground(mode);
  if (!checkLocalUser(mode)) return;

  prepareFormFrame(mode);
  if (mode === 'edit') showEditUI();

  contactFormBtn(mode);
  checkMode();
  updateCloseIcon();
  excludeNumbers();
  restrictToTel();
}

function renderFormBackground(mode) {
  const bg = document.getElementById("manipulateContactBackground");
  bg.innerHTML = window.innerWidth < 800
    ? contactDetailsTemp(mode, 'small')
    : contactDetailsTemp(mode, 'big');
  if (mode === "add") hideCancelBtn();
}

function prepareFormFrame(mode) {
  const frame = document.getElementById("addContactFrame");
  frame.dataset.mode = mode;

  document.getElementById("manipulateContactBackground").classList.replace("visibleNone", "showManipualteFormBackground");
  frame.classList.replace("visibleNone", "showManipualteFormFrame");
}

function showEditUI() {
  toggleClass("addContactRightInitialsDiv", "grayBackground");
  toggleClass("addContactRightInitials", "hide");
  toggleClass("addContactRightImg", "hide");
}

function updateCloseIcon() {
  const whichImg = window.innerWidth < 800 ? "closeWhite" : "close";
  changeImage("closeFormImg", whichImg);
}

/**
 * prevents input of numbers in the name field
 */
function excludeNumbers() {
  const name = document.getElementById("nameInputContact");
  name.addEventListener("keypress", function (e) {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
    }
  })
  name.addEventListener("input", function (e) {
    this.value = this.value.replace(/[0-9]/g, "");
  });
}

function restrictToTel() {
  document.getElementById("phoneInputContact").addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9+]/g, '');
  })
}

function toggleClass(element, className) {
  document.getElementById(element).classList.toggle(className)
}
/**
 * Checks the current mode (add or edit) of the contact form.
 * If the mode is "edit", populates the input fields with the existing contact's details
 * (name, email, and phone) from the contact details elements.
 *
 * Assumes the following element IDs exist in the DOM:
 * - "addContactFrame" with a `data-mode` attribute ("edit" or other)
 * - "nameInput", "emailInput", "phoneInput" for input fields
 * - "contactDetailsName", "contactDetailsMail", "contactDetailsPhone" for displaying contact details
 */
function checkMode() {
  const mode = document.getElementById("addContactFrame").dataset.mode;
  if (mode === "edit") {
    document.getElementById("nameInputContact").value = document.getElementById("contactDetailsName").innerText;
    document.getElementById("emailInputContact").value = document.getElementById("contactDetailsMail").innerText;
    document.getElementById("phoneInputContact").value = document.getElementById("contactDetailsPhone").innerText;
    document.getElementById("addContactRightInitials").innerHTML = document.getElementById("contactDetailsInitials").innerHTML;
    document.getElementById("addContactRightInitialsDiv").classList.remove(`grayBackground`)
    document.getElementById("addContactRightInitialsDiv").classList.add(`userColor-${ergebnisse[thisToken].color.replace('#', '')}`)
  }
}


/**
 * Checks if the current local user is authorized based on the provided mode.
 * For "edit" mode, verifies if the stored token matches the expected token.
 * If not authorized, triggers an error deletion and returns false.
 *
 * @param {string} mode - The operation mode, e.g., "edit".
 * @returns {boolean} True if the user is authorized, false otherwise.
 */
function checkLocalUser(mode) {
  const myToken = localStorage.getItem("token");
  if (mode === 'add') return true;

  if (isFirebaseContactAuthorized(mode)) return true;

  if (mode === "edit" && thisToken !== myToken) {
    displayEditErrorResponsive();
    return false;
  }

  if (mode === "delete" && thisToken !== myToken) {
    displayDeleteErrorResponsive();
    return false;
  }

  return true;
}

function isFirebaseContactAuthorized(mode) {
  try {
    return ['edit', 'delete'].includes(mode) &&
           fireBaseContent.contact[thisToken]?.type === 'contact';
  } catch {
    return false;
  }
}


function displayEditErrorResponsive() {
  const errorId = window.innerWidth < 800 ? "editErrorSpanResponsive" : "editErrorSpan";
  showError("", errorId, "You can't edit other<br>registered users.");
}

function displayDeleteErrorResponsive() {
  const errorId = window.innerWidth < 800 ? "editErrorSpanResponsive" : "deleteErrorSpan";
  showError("", errorId, "You can't delete other<br>registered users.");
}

/**
 * Hides the contact form and its background overlay by replacing their visible classes with a hidden class,
 * and hides the delete error message if it is displayed.
 */
function hideContactForm() {
  document.getElementById("manipulateContactBackground").classList.replace("showManipualteFormBackground", "visibleNone");
  document.getElementById("addContactFrame").classList.replace("showManipualteFormFrame", "visibleNone");
  hideError("","nameErrorSpanContact")
  hideError("","emailErrorSpanContact")
  hideError("","phoneErrorSpanContact")
}


/**
 * Updates the contact form action buttons based on the specified mode.
 *
 * @param {string} mode - The mode of the contact form. 
 *   If "edit", sets buttons for editing (Delete/Save).
 *   Otherwise, sets buttons for adding a new contact (Cancel/Create contact).
 */
function contactFormBtn(mode) {
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");

  if (mode === "edit") {
    leftBtn.innerHTML = `Delete<img id="leftBtnImg" src="../images/canceldarkblue.svg" class="marginLeft10"/>`;
    leftBtn.onclick = () => contactForm("delete", "edit");

    rightBtn.innerHTML = `Save<img src="../images/check.svg" class="marginLeft10"/>`;
    rightBtn.onclick = () => contactForm("save", "edit");
  } else {
    leftBtn.innerHTML = `Cancel<img id="leftBtnImg" src="../images/canceldarkblue.svg" class="marginLeft10"/>`;
    leftBtn.onclick = () => hideContactForm("add");

    rightBtn.innerHTML = `Create contact<img src="../images/check.svg" class="marginLeft10"/>`;
    rightBtn.onclick = () => contactForm("add", "add");
  }
}


/**
 * Handles contact form actions such as adding, saving, or deleting a contact.
 *
 * @async
 * @param {string} task - The action to perform. Can be "add", "save", or "delete".
 * @param {string} [mode] - Optional mode parameter used when deleting a contact.
 * @returns {Promise<void>} Resolves when the action is completed and the page is reloaded if an action was performed.
 */
async function contactForm(task, mode) {
  let email = getCurrentEmail().toLowerCase();
  let actionPerformed = false;

  switch (task) {
    case "add":
      actionPerformed = await handleAdd(email);
      break;
    case "save":
      actionPerformed = await handleSave(email);
      break;
    case "delete":
      actionPerformed = await handleDelete(email, task);
      break;
  }

  if (actionPerformed) {
    finalizeContactAction(email);
  }
}

function getCurrentEmail() {
  return document.getElementById("emailInputContact")?.value || 
         document.getElementById("contactDetailsMail").innerText;
}

async function handleAdd(email) {
  if (!emailIsValid(email)) return false;
  await addContactTask();
  return true;
}

async function handleSave(email) {
  if (!emailIsValid(email)) return false;
  await saveContact(email);
  return true;
}

async function handleDelete(email, mode) {
  return await deleteContact(email, mode);
}

function finalizeContactAction(email) {
  localStorage.setItem("lastEditedContact", email);
  hideContactForm();
  window.location.reload();
}


/**
 * Asynchronously adds a new contact by collecting input values for name, email, and phone.
 * If at least one of the fields is filled, it assigns a color and sends the contact data to the server.
 *
 * @async
 * @function
 * @returns {Promise<void>} Resolves when the contact has been added.
 */
async function addContactTask() {
  const name = document.getElementById("nameInputContact").value;
  const email = document.getElementById("emailInputContact").value.toLowerCase();
  const phone = document.getElementById("phoneInputContact").value;

  if (!name && !email && !phone) return;

  const color = '#FF7A00'
  await postData("contact", { name, email, phone, color, type: "contact" });
}


/**
 * Deletes a contact associated with the given email if the user is authorized.
 *
 * @async
 * @param {string} email - The email address of the contact to delete.
 * @param {string} mode - The mode of operation, either "edit" or another value, which determines the UI element for error display.
 * @returns {Promise<void>} Resolves when the contact is deleted or an error is handled.
 */
async function deleteContact(email, mode) {
  const token = await findUser(email);
  const myToken = localStorage.getItem("token");

  if (!checkLocalUser(mode)) return;

  // const elementId = mode === "edit" ? "leftBtn" : "deleteIcon";

  // if (token !== myToken && ergebnisse[token].type === "login") {
  //   window.innerWidth < 800?
  //   showError("", "editErrorSpanResponsive", "You can't delete other registered users."):
  //   showError("", "deleteErrorSpan", "You can't delete other<br>registered users.");
  //   return;
  // }
  await deleteData(`${ergebnisse[token].type}/${token}`);
  window.location.reload();
}

/**
 * Saves a contact by collecting input values and sending a PATCH request.
 * Determines the payload structure based on the user's type.
 *
 * @async
 * @param {string} email - The email address used to find the user token.
 * @returns {Promise<void>} Resolves when the contact is saved.
 */
async function saveContact(email) {
  const name = document.getElementById("nameInputContact").value;
  const phone = document.getElementById("phoneInputContact").value;
  // const token = await findUser(email);

  const payload =
    ergebnisse[thisToken].type === "contact"
      ? { name, email, phone }
      : { name, phone };

  await patchData(`${ergebnisse[thisToken].type}/${thisToken}`, payload);
}


/**
 * Changes the source of the image element with the ID "leftBtnImg" to a new variant.
 *
 * @param {string} variant - The variant string to append to the image filename (e.g., 'Active', 'Inactive').
 */
function changeImage(element, variant) {
  try {
    document.getElementById(element).src = `../images/${variant}.svg`;
  } catch (error) {
  }
}

/**
 * Remove or add the class "visibleNone" to the ID "manipulateOptionsFrame".
 *
 * @param {string} task - The task to decide whether ‘add’ or ‘remove’ is used.
 */
function showManipulateContactLinksOptions(task) {
  
  if(task == "show"){
  document.getElementById("manipulateOptionsFrame").classList.remove("visibleNone")
  }else{
  document.getElementById("manipulateOptionsFrame").classList.add("visibleNone")
  hideError("","editErrorSpanResponsive")
  }
}