const BASE_URL = 'https://join-6e686-default-rtdb.europe-west1.firebasedatabase.app/';

/**
 * Asynchronously loads JSON data from a specified path.
 *
 * @param {string} [path=""] - The relative path to the JSON file (excluding the ".json" extension).
 * @returns {Promise<any>} A promise that resolves to the parsed JSON data.
 * @throws {Error} If the fetch request fails or the response cannot be parsed as JSON.
 */
async function loadData(path = "") {
  const response = await fetch(BASE_URL + path + ".json");
  return await response.json();
}


/**
 * Sends a POST request to the specified path with the provided data.
 *
 * @async
 * @function postData
 * @param {string} path - The endpoint path to which the data will be sent (relative to the base URL).
 * @param {Object} data - The data to be sent in the request body.
 * @returns {Promise<Object>} A promise that resolves to the JSON response from the server.
 */
async function postData(path, data) {
  const response = await fetch(`${BASE_URL}${path}.json`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}


/**
 * Sends a PATCH request to update data at the specified path on the server.
 *
 * @async
 * @function patchTask
 * @param {string} taskId - The ID of the task to be updated.
 * @param {Object} data - The data to be sent in the request body.
 * @returns {Promise<Object>} A promise that resolves to the JSON response from the server.
 */
async function patchTask(taskId, data) {
  const BASE_URL = "https://join-6e686-default-rtdb.europe-west1.firebasedatabase.app/tasks";
  const response = await fetch(`${BASE_URL}/${taskId}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return await response.json();
}


/**
 * Sends a PATCH request to update data at the specified path on the server.
 *
 * @async
 * @function patchData
 * @param {string} [path=""] - The relative path to the resource to be updated.
 * @param {Object} [data={}] - The data to be sent in the request body.
 */
async function patchData(path = "", data = {}) {
  await fetch(BASE_URL + path + ".json", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}


async function putData(path = "", data = {}) {
  const targetURL = BASE_URL + path + ".json";
  const response = await fetch(targetURL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await response.json();
}


/**
 * Deletes data from the specified path on the server.
 *
 * @async
 * @function deleteData
 * @param {string} [path=""] - The relative path to the resource to be deleted.
 * @returns {Promise<Object>} A promise that resolves to an object indicating the success of the operation.
 *                             If the response contains JSON, it will return the parsed JSON object.
 *                             If an error occurs or no JSON is returned, it defaults to `{ success: true }`.
 */
async function deleteData(path = "") {
  await fetch(BASE_URL + path + ".json", {
    method: "DELETE"
  });
}


/**
 * Loads all users from Firebase and returns them as an array of objects.
 *
 * @async
 * @function loadUsers
 * @returns {Promise<Array<Object>>} A list of users with their details.
 */
async function loadUsers() {
  try {
    const usersObj = await loadData("login");
    return usersObj ? parseUsers(usersObj) : [];
  } catch (e) {
    console.error("Fehler beim Laden der Benutzer:", e);
    return [];
  }
}

function parseUsers(obj) {
  return Object.entries(obj).map(([id, u]) => ({
    id,
    name: u.name || '',
    email: u.email || '',
    color: u.color || '#A8A8A8'
  }));
}



/**
 * Applies user-specific colors to task assignee elements in the DOM.
 *
 * @async
 * @function applyUserColors
 */
async function applyUserColors() {
  try {
    const users = await loadUsers();
    const map = Object.fromEntries(users.map(u => [u.id, u.color]));
    document.querySelectorAll('.task-assignee').forEach(el => {
      const id = el.getAttribute('data-user-id');
      if (map[id]) el.style.backgroundColor = map[id];
    });
  } catch (e) {
    console.error("Fehler beim Anwenden der Benutzerfarben:", e);
  }
}


/**
 * Fills user links in the UI based on the current user.
 *
 * @async
 * @function fillUserLinks
 */
async function fillUserLinks() {
  try {
    const users = await loadAllUsers();
    const user = getCurrentUser(users);
    setUserLinkUI(user);
  } catch (e) {
    console.error("Fehler beim Aktualisieren der Benutzerlinks:", e);
  }
}


function getCurrentUser(users) {
  return users.find(u => u.id === localStorage.getItem("token"));
}


function setUserLinkUI(user) {
  const nameEl = document.getElementById("userName");
  const linkEl = document.getElementById("userLink");
  if (!user) {
    linkEl && (linkEl.innerHTML = "G");
    nameEl && (nameEl.innerHTML = "");
    return;
  }
  linkEl && (linkEl.innerHTML = getInitials(user.name));
  nameEl && (nameEl.innerHTML = user.name !== "Guest" ? user.name : "");
}



/**
 * Loads all data from Firebase into a global variable.
 *
 * @async
 * @function loadFromFirebase
 */
async function loadFromFirebase() {
  fireBaseContent = await loadData();
}


/**
 * Retrieves the next available color for a user from Firebase.
 *
 * @async
 * @function lastColor
 * @returns {Promise<string>} The next available color as a hex code.
 */
async function lastColor() {
  try {
    const users = await loadData("login");
    if (!users) return '#FF7A00';
    const usedColors = Object.values(users).map(u => u.color);
    const colors = getColorPalette();
    const unused = findUnusedColor(colors, usedColors);
    if (unused) return unused;
    return getNextColor(colors, usedColors);
  } catch (e) {
    console.error("Fehler beim Abrufen der letzten Farbe:", e);
    return '#FF7A00';
  }
}


function getColorPalette() {
  return ['#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1',
    '#FF745E', '#FFA35E', '#FC71FF', '#FFC701', '#0038FF',
    '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'];
}


function findUnusedColor(colors, usedColors) {
  return colors.find(c => !usedColors.includes(c));
}


function getNextColor(colors, usedColors) {
  const last = [...usedColors].reverse().find(c => colors.includes(c));
  return colors[(colors.indexOf(last) + 1) % colors.length];
}


/**
 * Returns the initials of a given full name.
 *
 * @param {string} [element] - The full name from which to extract initials.
 * @returns {string} The initials in uppercase letters.
 */
function getInitials(element) {
  let completeName = element.split(" ");
  let firstName = completeName[0]

  if (completeName.length == 1) {
    return firstName[0];
  } else {
    let lastName = (completeName.length == 1) ? "" : completeName[completeName.length - 1];
    return firstName[0] + lastName[0];
  }
}


/**
 * Loads all users and contacts from Firebase and combines them into a single list.
 *
 * @async
 * @function loadAllUsers
 * @returns {Promise<Array<Object>>} A combined list of users and contacts.
 */
async function loadAllUsers() {
  try {
    const [users, contacts] = await Promise.all([
      loadData("login"),
      loadData("contacts")
    ]);

    const allPeople = { ...users, ...contacts };
    return Object.entries(allPeople).map(([id, person]) => ({
      id,
      name: person.name || "",
      color: person.color || "#A8A8A8",
      email: person.email || ""
    }));
  } catch (error) {
    console.error("Fehler beim Laden aller Benutzer:", error);
    return [];
  }
}

