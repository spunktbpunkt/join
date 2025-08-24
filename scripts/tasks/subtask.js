/**
 * subtask.js - Verwalten von Subtasks (Checkbox-Logik, UI, ProgressBar)
 */

const subtasks = [];

/**
 * Initialization Functions
 */

/**
 * Initializes the subtasks array with data from the given task.
 * @param {Object} taskData - The task data containing subtasks.
 */
function initSubtasksArray(taskData) {
  subtasks.length = 0;
  if (!Array.isArray(taskData.subtasks)) return;
  for (let i = 0; i < taskData.subtasks.length; i++) {
    const s = taskData.subtasks[i];
    subtasks.push({ name: s.name, completed: s.completed });
  }
}

/**
 * Initializes the subtask module by setting up the subtasks array and updating the UI.
 * @param {Object} taskData - The task data to initialize the module with.
 */
function initializeSubtaskModule(taskData) {
  initSubtasksArray(taskData);
  updateSubtaskList();
  updateProgressBar();
}

/**
 * Mode Check Functions
 */

/**
 * Checks if the current mode is edit mode.
 * @returns {boolean} True if in edit mode, false otherwise.
 */
function isEditMode() {
    const overlay = document.getElementById('taskOverlay');
    return overlay?.querySelector('.add-task-card')?.classList.contains('edit-mode');
}

/**
 * Checks if the current mode is add mode.
 * @returns {boolean} True if in add mode, false otherwise.
 */
function isAddMode() {
    const overlay = document.getElementById('taskOverlay');
    return overlay?.classList.contains('add-task-page') || 
           document.body.classList.contains('add-task-page') || 
           window.location.pathname.includes('addTask.html');
}

/**
 * Subtask List and Progress Functions
 */

/**
 * Updates the subtask list in the UI and recalculates progress.
 * @param {string} taskId - The ID of the task to update.
 */
function updateSubtaskList(taskId) {
    const list = document.getElementById('subtask-list');
    if (!list) return;

    const subtasksHTML = generateSubtasksHTML();
    list.innerHTML = subtasksHTML;

    const { done, total } = calculateSubtaskProgress();
    updateSubtaskCount(taskId, done, total);
}

/**
 * Generates the HTML for the subtasks based on the current mode.
 * @returns {string} The generated HTML for the subtasks.
 */
function generateSubtasksHTML() {
    const editMode = isEditMode();
    const addMode = isAddMode();
    return subtasks
        .map((s, i) => (addMode || editMode ? subtasksTemplate(s, i) : taskOverlaySubtaskTemplate(s, i)))
        .join("");
}

/**
 * Calculates the progress of the subtasks.
 * @returns {Object} An object containing the number of completed and total subtasks.
 */
function calculateSubtaskProgress() {
    const done = subtasks.filter((s) => s.completed).length;
    const total = subtasks.length;
    return { done, total };
}

/**
 * Updates the subtask count display in the UI.
 * @param {string} taskId - The ID of the task to update.
 * @param {number} done - The number of completed subtasks.
 * @param {number} total - The total number of subtasks.
 */
function updateSubtaskCount(taskId, done, total) {
    const subtaskCountSpan = document.querySelector(`#task${taskId} .subtask-count`);
    if (subtaskCountSpan) {
        subtaskCountSpan.textContent = `${done}/${total} Subtasks`;
        subtaskCountSpan.classList.toggle("all-done", done === total && total > 0);
        subtaskCountSpan.classList.toggle("not-done", done !== total);
    }
}

/**
 * Normalizes task.subtasks and calculates count and progress.
 * @param {Object} task - The task object containing subtasks.
 * @returns {{completedSubtasks: number, totalSubtasks: number, progressPercentage: number}} An object with subtask progress details.
 */
function checkSubProgress(task) {
  const subs = Array.isArray(task.subtasks)
    ? task.subtasks
    : task.subtasks && typeof task.subtasks === "object"
    ? Object.values(task.subtasks)
    : [];

  const totalSubtasks = subs.length;
  const completedSubtasks = subs.filter((s) => s.completed === true).length;
  const progressPercentage =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return { completedSubtasks, totalSubtasks, progressPercentage };
}


/**
 * Updates the progress bar for the current task.
 */
function updateProgressBar() {
    if (!currentTask?.id) return;

    const { done, total, pct } = calculateProgress();
    const taskEl = document.getElementById(`task${currentTask.id}`);
    if (!taskEl) return;

    updateProgressBarUI(taskEl, pct);
    updateTaskLabel(taskEl, done, total);
}

/**
 * Calculates the progress percentage of the subtasks.
 * @returns {Object} An object containing the number of completed subtasks, total subtasks, and progress percentage.
 */
function calculateProgress() {
    const done = subtasks.filter(s => s.completed).length;
    const total = subtasks.length;
    const pct = total > 0 ? (done / total) * 100 : 0;
    return { done, total, pct };
}

/**
 * Updates the progress bar UI for the given task element.
 * @param {HTMLElement} taskEl - The task element to update.
 * @param {number} pct - The progress percentage to set.
 */
function updateProgressBarUI(taskEl, pct) {
    const bar = taskEl.querySelector('.subtask-progress-bar');
    if (bar) bar.style.width = `${pct}%`;
}

/**
 * Updates the task label with the subtask progress.
 * @param {HTMLElement} taskEl - The task element to update.
 * @param {number} done - The number of completed subtasks.
 * @param {number} total - The total number of subtasks.
 */
function updateTaskLabel(taskEl, done, total) {
    const label = taskEl.querySelector('.subtask-count');
    if (label) {
        label.textContent = `${done}/${total} Subtasks`;
        label.classList.toggle('all-done', done === total && total > 0);
        label.classList.toggle('not-done', done !== total);
    }
    taskEl.classList.toggle('all-done', done === total && total > 0);
    taskEl.classList.toggle('not-done', done !== total);
}

/**
 * Subtask Actions
 */

/**
 * Toggles the completion status of a subtask and updates the UI.
 * @param {number} index - The index of the subtask to toggle.
 */
async function toggleSubtaskCompletion(index) {
  subtasks[index].completed = !subtasks[index].completed;
  updateSubtaskList();
  updateProgressBar();

  if (currentTask?.id) {
    const updatedSubtasks = subtasks.map(s => ({ name: s.name, completed: s.completed }));
    await patchTask(currentTask.id, { subtasks: updatedSubtasks });
  }
}

/**
 * Edits a subtask by enabling the editing mode for the given index.
 * @param {number} index - The index of the subtask to edit.
 */
function editSubtask(index) {
  const subtaskItem = getSubtaskItem(index);
  if (!subtaskItem) return;

  prepareSubtaskForEditing(subtaskItem, index);
  focusOnEditInput(subtaskItem);
}

/**
 * Retrieves the subtask item element for the given index.
 * @param {number} index - The index of the subtask.
 * @returns {HTMLElement|null} The subtask item element or null if not found.
 */
function getSubtaskItem(index) {
  const subtaskItems = document.querySelectorAll(".subtask-item");
  return subtaskItems[index] || null;
}

/**
 * Prepares a subtask item for editing by updating its UI.
 * @param {HTMLElement} subtaskItem - The subtask item element to prepare.
 * @param {number} index - The index of the subtask.
 */
function prepareSubtaskForEditing(subtaskItem, index) {
  const subtaskText = subtaskItem.querySelector(".subtask-text");
  const subtaskIcons = subtaskItem.querySelector(".subtask-icons");

  subtaskItem.classList.add("editing");

  subtaskText.innerHTML = `
      <input type="text" class="edit-input" maxlength="40" value="${subtasks[index].name}" 
         data-index="${index}" onkeypress="handleEditKeyPress(event, ${index})" 
         onblur="handleInputBlur(event, ${index})">
    `;

  subtaskIcons.innerHTML = `
      <img src="../images/subtaskBin.svg" alt="Delete" 
           class="subtask-icon delete-subtask" data-index="${index}">
      <img src="../images/checkDark.svg" alt="Save" 
           class="subtask-icon confirm-subtask" data-index="${index}">
    `;
}

/**
 * Focuses on the edit input field of a subtask item.
 * @param {HTMLElement} subtaskItem - The subtask item element to focus on.
 */
function focusOnEditInput(subtaskItem) {
  const editInput = subtaskItem.querySelector(".edit-input");
  if (editInput) editInput.focus();
}

/**
 * Handles the key press event for editing a subtask.
 * @param {KeyboardEvent} event - The key press event.
 * @param {number} index - The index of the subtask being edited.
 */
function handleEditKeyPress(event, index) {

  if (event.key === "Enter") {
    saveSubtask(index);
  }
}

/**
 * Saves the changes made to a subtask.
 * @param {number} index - The index of the subtask to save.
 */
async function saveSubtask(index) {
    const subtaskItem = getSubtaskItemForSave(index);
    if (!subtaskItem) return;

    const newValue = getNewSubtaskValue(subtaskItem, index);
    if (!newValue) return;

    updateSubtaskName(index, newValue);
    finalizeSubtaskEditing(subtaskItem);

}

/**
 * Retrieves the subtask item element for saving.
 * @param {number} index - The index of the subtask.
 * @returns {HTMLElement|null} The subtask item element or null if not found.
 */
function getSubtaskItemForSave(index) {
    return document.querySelector(`.subtask-item[data-subtask-index="${index}"]`) || null;
}

/**
 * Retrieves the new value of a subtask from its input field.
 * @param {HTMLElement} subtaskItem - The subtask item element.
 * @returns {string|null} The new value of the subtask or null if not found.
 */
function getNewSubtaskValue(subtaskItem) {
    const input = subtaskItem.querySelector(".edit-input");
    return input ? input.value.trim() : null;
}

/**
 * Updates the name of a subtask.
 * @param {number} index - The index of the subtask to update.
 * @param {string} newValue - The new name of the subtask.
 */
function updateSubtaskName(index, newValue) {
    if (subtasks[index]) subtasks[index].name = newValue;
}

/**
 * Finalizes the editing of a subtask by updating its UI.
 * @param {HTMLElement} subtaskItem - The subtask item element to finalize.
 */
function finalizeSubtaskEditing(subtaskItem) {
    subtaskItem.classList.remove("editing");
    updateSubtaskList();
}

/**
 * Deletes a subtask and updates the UI.
 * @param {number} index - The index of the subtask to delete.
 */
async function deleteSubtask(index) {
  subtasks.splice(index, 1);
  updateSubtaskList();

  if (currentTask?.id) {
    const updatedSubtasks = subtasks.map(s => ({ name: s.name, completed: s.completed }));
    await patchTask(currentTask.id, { subtasks: updatedSubtasks });
  }
}

/**
 * Event Listeners
 */

/**
 * Sets up event listeners for subtask-related actions.
 */
function setupSubtaskListeners() {
  const addIcon = document.getElementById("add-icon");
  const closeIcon = document.getElementById("close-subtask-icon");
  const checkIcon = document.getElementById("check-subtask-icon");
  const subInput = document.getElementById("subtask-input");
  if (!addIcon || !subInput || !closeIcon || !checkIcon) return;

  addIcon.addEventListener("click", onAddIconClick);
  subInput.addEventListener("keypress", onSubInputKeyPress);
  checkIcon.addEventListener("click", onCheckIconClick);
}

function onAddIconClick() {
  const subInput = document.getElementById("subtask-input");
  if (subInput.value.trim() !== "") {
    confirmSubtaskEntry();
    toggleIcons(false);
  } else {
    activateSubtaskInput();
  }
}

function onSubInputKeyPress(e) {
  const subInput = e.target;
  if (e.key === "Enter") {
    e.preventDefault();
    e.stopPropagation();
    confirmSubtaskEntry();
    subInput.value = "";
    toggleIcons(false);
  }
}

function onCheckIconClick() {
  const subInput = document.getElementById("subtask-input");
  subInput.value = "";
  toggleIcons(false);
}

/**
 * Checks and handles subtask-related click events.
 */
function checkSubtaskClass() {
    document.addEventListener("click", handleSubtaskClick);
}

function handleSubtaskClick(e) {
    if (e.target.classList.contains("edit-subtask")) {
        handleEditSubtask(e);
    } else if (e.target.classList.contains("delete-subtask")) {
        handleDeleteSubtask(e);
    } else if (e.target.classList.contains("confirm-subtask")) {
        handleConfirmSubtask(e);
    } else if (e.target.id === "close-subtask-icon") {
        handleCloseSubtaskInput();
    }
}

function handleEditSubtask(e) {
    const index = +e.target.dataset.index;
    editSubtask(index);
}

function handleDeleteSubtask(e) {
    const index = +e.target.dataset.index;
    deleteSubtask(index);
}

function handleConfirmSubtask(e) {
    const index = +e.target.dataset.index;
    saveSubtask(index);
}

function handleCloseSubtaskInput() {
    toggleIcons(false);
    const subInput = document.getElementById("subtask-input");
    if (subInput) subInput.value = "";
}


/**
 * Activates the subtask input field for adding a new subtask.
 */
function activateSubtaskInput() {
  const subInput = document.getElementById("subtask-input");
  if (!subInput) return;

  subInput.style.color = "#000000";
  toggleIcons(true);
  subInput.focus();
}

/**
 * Toggles the visibility of subtask-related icons.
 * @param {boolean} isActive - Whether to show or hide the icons.
 */
function toggleIcons(isActive) {
  const addIcon = document.getElementById("add-icon");
  const checkIcon = document.getElementById("check-subtask-icon");
  const closeIcon = document.getElementById("close-subtask-icon");
  const seperator = document.getElementById("seperator");

  if (!addIcon || !checkIcon || !closeIcon || !seperator) return;

  addIcon.classList.toggle("d-none", isActive);
  checkIcon.classList.toggle("d-none", !isActive);
  closeIcon.classList.toggle("d-none", !isActive);
  seperator.classList.toggle("d-none", !isActive);
}

/**
 * Confirms the entry of a new subtask and updates the UI.
 */
function confirmSubtaskEntry() {
  const subInput = document.getElementById("subtask-input");
  if (!subInput) return;

  const val = subInput.value.trim();
  if (val) {
    subtasks.push({ name: val, completed: false });
    updateSubtaskList();
    const subInput = document.getElementById("subtask-input");
      subInput.value = "";
  }
}

/**
 * Handles the blur event of the input field for subtasks.
 * @param {Event} event - The blur event.
 * @param {number} index - The index of the subtask.
 */
function handleInputBlur(event, index) {
    const input = event.target;
    if (input.value.trim() === "") {
        deleteSubtask(index);
    } else {
        saveSubtask(index);
    }
}

document.addEventListener("DOMContentLoaded", () => {
  setupSubtaskListeners();
  checkSubtaskClass();
});