/**
 * taskOverlay.js - managing display, editing and creation overlays of tasks
 * 
 */

let currentTask = null;
let isEditing = false;


/**
 * Initalises all overlay components of edit / add
 *
 * @param {HTMLElement} overlayContainer  container element of the overlay
 * @param {Array}       assignees         array containing data of users and contacts
 * @param {Object}      taskData          current task data
 */
function initOverlaySetup(overlayContainer, assignees, taskData) {
  initPriorityButtons(overlayContainer);
  renderDropdownOptions(assignees, taskData.assignedTo || []);
  updateAssignedChips(assignees);
  setupDropdownEventListeners(assignees);
  initializeOverlayFeatures();
  initializeSubtaskModule(taskData);
  toggleIcons(false);
}

/**
 * Initialises overlay features like buttons, calender and colors depending on the page being loaded
 */
function initializeOverlayFeatures() {
  const taskOverlay = document.getElementById("taskOverlay");
  if (taskOverlay) {
    taskOverlay.style.display = "flex";
    initPriorityButtons();
    setupDatePicker();
    applyUserColors();
  } else if (document.body.classList.contains("add-task-page")) {
    initPriorityButtons();
    setupDatePicker();
    setupFieldListeners();
  }
}


function showTaskOverlayById(taskId) {
  document.body.classList.add("no-scroll");
  showTaskOverlay(taskId);
}

/**
 * shows a detailed overview about the task that was clicked
 * @param {String} taskId - task specific id string saved in the database
 */
async function showTaskOverlay(taskId) {
  const [users, allTasks] = await loadOverlayData();
  const rawTask = allTasks?.[taskId];
  if (!rawTask) return warnTaskNotFound(taskId);
  const taskData = prepareTaskData(taskId, rawTask, users);
  const overlayContainer = document.getElementById("taskOverlay");
  renderOverlay(overlayContainer, taskData);
  initOverlaySetup(overlayContainer, users, taskData);
  updateSubtaskList(taskId);
}

function warnTaskNotFound(taskId) {
  console.warn(`Task ${taskId} nicht gefunden`);
}
function loadOverlayData() {
  return Promise.all([loadFirebaseUsers(), loadData("tasks")]) || [[], {}];
}
function prepareTaskData(taskId, rawTask, users) {
  const taskData = { id: taskId, ...rawTask };
  checkUserColor(taskData, users);
  initSubtasksArray(taskData);
  currentTask = taskData;
  return taskData;
}
function renderOverlay(container, taskData) {
  container.innerHTML = generateTaskOverlay(taskData);
  container.classList.remove("d-none");
  container.style.display = "flex";
}

/**
 * shows the overlay to add a new task based on the stage of the clicked task container
 * 
 * @param {Integer} stage 
 */
function showAddTaskOverlay(stage) {
  document.body.classList.add("no-scroll", "add-task-page");
  renderAddTaskOverlay(stage);
  setupAddTaskOverlay(stage);
  loadAndInitAssignees();
}

function renderAddTaskOverlay(stage) {
  const container = document.getElementById("taskOverlay");
  if (container) {
    container.innerHTML = addTaskOverlayTemplate(stage);
    container.classList.remove("d-none");
    container.style.display = "flex";
  }
}
function setupAddTaskOverlay(stage) {
  initPriorityButtons();
  initializeOverlayFeatures();
  setupTaskForm(stage);
  setupSubtaskListeners();
  checkSubtaskClass();
}
function loadAndInitAssignees() {
  Promise.all([loadFirebaseUsers(), loadFirebaseContacts()])
    .then(([users, contacts]) => {
      const assignees = [...users, ...contacts];
      renderDropdownOptions(assignees);
      setupDropdownEventListeners(assignees);
      updateAssignedChips(assignees);
    })
    .catch(err => console.error("Dropdown init fehlgeschlagen:", err));
}


/**
 * loads a tasks and returns null if it does not exist
 */
async function loadTaskById(id) {
  if (currentTask?.id === id) return currentTask;
  const all = await loadData("tasks") || {};
  const raw = all[id];
  return raw ? { id, ...raw, subtasks: raw.subtasks || [] } : null;
}


/**
 * sets the handler for the save button to get and patch task data
 *
 * @param {HTMLElement} overlayContainer  Container des Overlays
 * @param {Object}      taskData          Aktuelle Task-Daten
 */
function registerSaveTaskHandler(overlayContainer, taskData) {
  const saveBtn = overlayContainer.querySelector("#save-task-btn");
  saveBtn.addEventListener("click", async () => {
    const data = getFormData();
    if (!validateFormData(data)) return;
    await patchTask(taskData.id, {
      ...data,
      subtasks: subtasks.map(s => ({ name: s.name, completed: s.completed }))
    });
    closeOverlay();
    window.location.reload();
  });
}

/**
 * shows the overlay to edit the task that was clicked
 * 
 * @param {String} taskId 
 */
async function showEditTaskOverlay(taskId) {
  closeOverlay();
  document.body.classList.add("no-scroll");
  const taskData = await loadTaskById(taskId);
  if (!taskData) return;
  const assignees = await loadEditAssignees();
  renderEditTaskOverlay(taskData, assignees);
  setupEditTaskOverlay(document.getElementById("taskOverlay"), assignees, taskData);
  currentTask = taskData;
}

async function loadEditAssignees() {
  const [users, contacts] = await Promise.all([
    loadFirebaseUsers(),
    loadFirebaseContacts()
  ]);
  return [...users, ...contacts];
}
function renderEditTaskOverlay(taskData, assignees) {
  const overlayContainer = document.getElementById("taskOverlay");
  overlayContainer.innerHTML = editTaskOverlayTemplate(taskData, assignees);
  overlayContainer.classList.remove("d-none");
  overlayContainer.style.display = "flex";
}
function setupEditTaskOverlay(overlayContainer, assignees, taskData) {
  initOverlaySetup(overlayContainer, assignees, taskData);
  setupSubtaskListeners();
  checkSubtaskClass();
  registerSaveTaskHandler(overlayContainer, taskData);
}

/**
 * closes an overlay on button press
 */
function closeOverlay() {
  document.body.classList.remove("no-scroll");
  const container = document.getElementById("taskOverlay");
  if (container) {
    container.innerHTML = "";
    container.classList.add("d-none");
    container.style.display = "none";
    if (typeof subtasks !== "undefined") {
      subtasks.length = 0;
    }
  }
  document.body.classList.remove("add-task-page");
  currentTask = null;
  isEditing = false;
}


function checkUserColor(taskData, users) {
  if (!Array.isArray(taskData.assignedTo)) return;
  taskData.assignedTo.forEach(ass => {
    const u = users.find(u => u.id === ass.id);
    if (u) ass.color = u.color;
  });
}


function handleOverlayClick(event) {
  if (event.target.id === "taskOverlay") {
    closeOverlay();
  }
}