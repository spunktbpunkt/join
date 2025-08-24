// addTaskDropDown.js

/**
 * Initializes the assign dropdown for tasks by loading users and contacts from Firebase,
 * rendering the dropdown options, and setting up event listeners.
 */
async function initAssignedDropdown() {
  try {
    const users = await loadFirebaseUsers();
     const contacts = await loadFirebaseContacts();
     const options  = [...users, ...contacts];
    renderDropdownOptions(options);
    setupDropdownEventListeners(options);
  } catch (err) {
    console.error("Fehler beim Initialisieren des Dropdowns:", err);
  }
}


/**
 * Renders the options in the dropdown.
 * @param {Array<Object>} users - The list of users.
 * @param {Array<Object>} [assignedTo=[]] - The already assigned users.
 */
function renderDropdownOptions(users, assignedTo = []) {
  const opts = document.getElementById("assignedDropdownOptions");
  if (!opts) return;

  opts.innerHTML = users
    .map((user, index) => {
      const isChecked = assignedTo.some(a => String(a.id) === String(user.id));
      return assignedUserTemplate(user, index, isChecked);
    })
    .join("");
}


/**
 * Sets up event listeners for the dropdown.
 * @param {Array<Object>} users - The list of users.
 */
function setupDropdownEventListeners(users) {
  const sel = document.getElementById("assignedDropdownSelected");
  const opts = document.getElementById("assignedDropdownOptions");
  const dd = document.getElementById("assignedDropdown");

  if (!sel || !opts || !dd) {
    return;
  }

  addDropdownToggleListener(sel, opts);
  addDocumentClickListener(dd, opts);
  addOptionsChangeListener(opts, users);
}


/**
 * Adds a click listener to toggle the dropdown.
 * @param {HTMLElement} sel - The selected dropdown element.
 * @param {HTMLElement} opts - The dropdown options.
 */
function addDropdownToggleListener(sel, opts) {
  sel.addEventListener("click", function (e) {
    e.stopPropagation();
    opts.classList.toggle("show");
  });

  sel.tabIndex = 0;
}


/**
 * Adds a click listener to the document to close the dropdown when clicking outside.
 * @param {HTMLElement} dd - The dropdown element.
 * @param {HTMLElement} opts - The dropdown options.
 */
function addDocumentClickListener(dd, opts) {
  document.addEventListener("click", function (e) {
    if (!dd.contains(e.target)) {
      opts.classList.remove("show");
    }
  });
}


/**
 * Adds event listeners to a select or options element for handling user assignment changes.
 *
 * - On "change" event, updates the assigned user chips.
 * - On "click" event within an element with the class 'assigned-user-details', toggles the associated checkbox
 *   (unless the checkbox itself was clicked), and updates the assigned user chips.
 *
 * @param {HTMLElement} opts - The select or container element to attach listeners to.
 * @param {Array<Object>} users - The list of user objects to be used when updating assigned chips.
 */
function addOptionsChangeListener(opts, users) {
  opts.addEventListener("change", function () {
    updateAssignedChips(users);
  });

  opts.addEventListener("click", function (e) {
    const details = e.target.closest('.assigned-user-details');
    if (!details) return;
    const checkbox = details.querySelector('.assign-checkbox');
    if (!checkbox) return;
    if (e.target === checkbox) return;
    checkbox.checked = !checkbox.checked;
    updateAssignedChips(users);
  });
}


/**
 * Updates the assigned chips based on the selected users.
 * @param {Array<Object>} users - The list of users.
 */
function updateAssignedChips(users) {
  const chipsContainer = document.getElementById("assignedChips");
  if (!chipsContainer) return;

  updateChips(users);
}


function updateChips(users) {
  const chipsContainer = document.getElementById("assignedChips");
  if (!chipsContainer) return;

  const checkboxes = document.querySelectorAll(".assign-checkbox");
  const chips = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => createChipHTML(users, cb.dataset.userId));

  chipsContainer.innerHTML = chips.join("");
}


function createChipHTML(users, userId) {

  const user = users.find(u => String(u.id) === String(userId));
  if (!user) return "";
  const initials = getInitials(user.name || user.email);
  return `<div class="assigned-chip" style="background-color: ${user.color};">${initials}</div>`;
}


/**
 * Returns the initials of a name or email.
 * @param {string} [fullName=""] - The full name or email address.
 * @returns {string} The initials.
 */
function getInitials(fullName = "") {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map(n => n[0].toUpperCase())
    .join("");
}

/**
 * Loads the users from Firebase.
 * @returns {Promise<Array<Object>>} A list of users.
 */
async function loadFirebaseUsers() {
  const res      = await fetch(BASE_URL + "/login.json");
  const usersObj = await res.json();
  const users    = [];

  if (usersObj) {
    for (const key in usersObj) {
      const entry = usersObj[key];
      const { password, ...rest } = entry;
      users.push({
        id:    key,
        ...rest,
      });
    }
  }
  return users;
}

/**
 * Loads the contacts from Firebase.
 * @returns {Promise<Array<Object>>} A list of contacts.
 */
async function loadFirebaseContacts() {
  const res         = await fetch(BASE_URL + "/contact.json");
  const contactsObj = await res.json();
  const contacts    = [];

  if (contactsObj) {
    for (const key in contactsObj) {
      const entry = contactsObj[key];
      contacts.push({
        id:    key,
        ...entry
      });
    }
  }
  return contacts;
}