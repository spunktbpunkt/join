let allTasks = [];

/**
 * Initializes the board by setting up user links, fetching data, rendering tasks,
 * and configuring drag-and-drop functionality.
 */
async function init() {
  fillUserLinks();
  await fetchData();
  await renderTasks();
  setupDragDrop();
  setupSubtaskInputListeners();
  getCurrentHTML();
  addHelpToPopup();
  initializeTaskSearch();
}

/**
 * Sets up listeners for the subtask input field to toggle visibility of action buttons.
 */
function setupSubtaskInputListeners() {
  const inputField = document.querySelector("#subtasks input");
  const plus = document.getElementById("subtaskPlus");
  const cross = document.getElementById("subtaskCross");
  const check = document.getElementById("subtaskCheck");

  if (inputField) {
    inputField.addEventListener("input", function () {
      if (inputField.value.trim() !== "") {
        plus.style.display = "none";
        cross.style.display = "unset";
        check.style.display = "unset";
      } else {
        plus.style.display = "unset";
        cross.style.display = "none";
        check.style.display = "none";
      }
    });
  }
}

/**
 * Updates the stage of a task in Firebase based on the container it is moved to.
 * @param {HTMLElement} container - The container element representing the new stage.
 * @param {string} taskId - The unique identifier of the task to update.
 */
async function updateStage(container, taskId) {
  const newStage = getStageFromContainer(container.id);
  const task = allTasksSearch[taskId];

  if (task) {
    task.stage = newStage;

   await putData("tasks/" + taskId, task);

    const taskElement = document.getElementById("task" + taskId);
    if (taskElement) {
      container.appendChild(taskElement);
      insertNoTaskPlaceholders();
    }

    allTasksSearch[taskId].stage = newStage;
  }
}


/**
 * Maps container IDs to their corresponding stage indices.
 * @param {string} containerId - The ID of the container.
 * @returns {number} The stage index corresponding to the container ID.
 */
function getStageFromContainer(containerId) {
  switch (containerId) {
    case "toDo":
      return 0;
    case "inProgress":
      return 1;
    case "awaitFeedback":
      return 2;
    case "done":
      return 3;
    default:
      return 0;
  }
}

/**
 * Fetches all tasks from Firebase and populates the global `allTasks` array.
 */
async function fetchData() {
  const res = await fetch(BASE_URL + "/tasks.json");
  const tasks = await res.json();
  allTasks = [];

  if (tasks) {
    for (const key in tasks) {
      const task = tasks[key];
      if (task.stage != null) {
        allTasks.push({ ...task, id: key });
      }
    }
  }

  renderTasks();
}

/**
 * Renders all four columns of the board with tasks.
 */
async function renderTasks() {
  const containers = document.querySelectorAll("#boardContent .task-list");
  renderColumnBtns(containers);

  for (let i = 0; i < 4; i++) {
    const stageTasks = allTasks.filter((task) => task.stage === i);
   
    stageTasks.forEach((task) => {
      containers[i].innerHTML += generateTaskCard(task);
    });
  }

  addDragFunction();
  await applyUserColors();
}

/**
 * Renders buttons for each column of the board.
 * @param {NodeList} containers - The list of container elements for the columns.
 * @returns {NodeList} The updated list of containers with buttons rendered.
 */
function renderColumnBtns(containers) {
  const statusLabels = ["To do", "In Progress", "Await Feedback", "Done"];
  const statusKeys = ["todo", "inProgress", "awaitFeedback", "done"];

  containers.forEach((container, i) => {
    container.innerHTML = columnBtnTemplate(statusLabels[i], statusKeys[i]);
  });
  return containers;
}

/**
 * Applies user-specific colors to task assignee avatars.
 */
async function applyUserColors() {
  try {
    const allUsers = await loadAllUsers();
    const peopleById = allUsers.reduce((map, person) => {
      map[person.id] = person;
      return map;
    }, {});

    document.querySelectorAll(".task-assignee").forEach((el) => {
      const uid = el.dataset.userId;
      const person = peopleById[uid];
      if (person && person.color) {
        el.style.backgroundColor = person.color;
      }
    });
  } catch (err) {
    console.error("Fehler beim Anwenden der Benutzerfarben:", err);
  }
}

/**
 * Checks if the current device is a mobile device based on screen width.
 * @returns {boolean} True if the device is mobile, false otherwise.
 */
function isMobile() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 800;
}

/**
 * Move search input field to responsive layout
 */
function moveInputFieldOnResize() {
  const searchInputField = document.getElementById("searchInput");
  const originalParent = document.querySelector("#boardHeader div");
  const newParent = document.getElementById("searchInput-resp-target");

  if (isMobile()) {
    if (!newParent.contains(searchInputField)) {
      newParent.appendChild(searchInputField);
    }
  } else {
    if (!originalParent.contains(searchInputField)) {
      originalParent.insertBefore(searchInputField, originalParent.firstChild);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  moveInputFieldOnResize();
  window.addEventListener("resize", moveInputFieldOnResize);
});