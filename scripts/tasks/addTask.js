/**
 * addTask.js - Enthält alle Logiken und Hilfsfunktionen zur Erstellung eines neuen Tasks.
 */

let activePriorityButton = null;
let priorityButtons = [];

/**
 * Initializes the Add Task page by setting up user links, loading the current HTML, and adding help popups.
 */
function initAddTask() {
  fillUserLinks();
  getCurrentHTML();
  addHelpToPopup();
}

/**
 * Sets up the task form for creating a new task.
 * @param {string} stage - The stage of the task (e.g., 'todo', 'inProgress').
 */
function setupTaskForm(stage) {
  const taskForm = document.getElementById("taskForm");
  if (!taskForm) return;

  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();
    createTask(stage);
  });
}

/**
 * Creates a new task based on the form data.
 * @param {string} stage - The stage of the task (e.g., 'todo', 'inProgress').
 */
async function createTask(stage) {
  const data = getFormData();
  if (!validateFormData(data)) return;

  const stageMap = { todo: 0, inProgress: 1, awaitFeedback: 2, done: 3 };
  data.stage = stageMap[stage] ?? 0;
  data.taskIndex = Date.now();

  try {
    await postData("tasks", data);
    clearForm();
    closeOverlay(true);
    window.location.href = "board.html";
  } catch (err) {
    console.error("Fehler:", err);
  }
}

/**
 * Returns the stage of a task based on its status.
 * @param {string} status - The status of the task.
 * @returns {number} The stage of the task.
 */
function getStageFromStatus(status) {
  const map = { todo: 0, inProgress: 1, awaitFeedback: 2, done: 3 };
  return map[status] ?? 0;
}

/**
 * Retrieves data from the task form.
 * @returns {Object|null} The form data or null if invalid.
 */
function getFormData() {
  const elements = getFormElements();
  if (!validateFormElements(elements)) return null;
  const { title, description, dueDate, category } = getFormValues(elements);
  const priority = getActivePriority();
  const assignedTo = getAssignedContacts();
  const subtasksData = getSubtasksData();

  return {
    title,
    description,
    dueDate,
    priority,
    assignedTo,
    category,
    subtasks: subtasksData,
  };
}

/**
 * Extracts values from the form elements.
 * @param {Object} elements - The form elements.
 * @returns {Object} The extracted values.
 */
function getFormValues(elements) {
  const { titleInput, descriptionInput, dateInput, categorySelect } = elements;

  return {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    dueDate: dateInput.value.trim(),
    category: categorySelect.value,
  };
}

/**
 * Retrieves the form elements.
 * @returns {Object} The form elements.
 */
function getFormElements() {
  return {
    titleInput: document.getElementById("title"),
    descriptionInput: document.getElementById("description"),
    dateInput: document.getElementById("due-date"),
    categorySelect: document.getElementById("categorySelect"),
    priorityButtons: document.querySelectorAll(".priority-buttons .priority"),
  };
}

/**
 * Validates the form elements.
 * @param {Object} elements - The form elements.
 * @returns {boolean} True if valid, otherwise false.
 */
function validateFormElements(elements) {
  return (
    elements.titleInput &&
    elements.descriptionInput &&
    elements.dateInput &&
    elements.categorySelect &&
    elements.priorityButtons.length > 0
  );
}

/**
 * Validates the form data and updates the UI for invalid fields.
 * @param {Object} data - The form data to validate.
 * @returns {boolean} True if the data is valid, otherwise false.
 */
function validateFormData(data) {
  const titleInput = document.getElementById("title");
  const dateInput = document.getElementById("due-date");
  const categorySelect = document.getElementById("categorySelect");

  const isTitleValid = validateField(titleInput, data.title, "title-error");
  const isDateValid = validateField(dateInput, data.dueDate, "due-date-error");
  const isCategoryValid = validateCategory(categorySelect, data.category);

  return isTitleValid && isDateValid && isCategoryValid;
}

/**
 * Validates a single field and updates its error message.
 * @param {HTMLElement} field - The input field to validate.
 * @param {string} value - The value to check.
 * @param {string} errorId - The ID of the error message element.
 * @returns {boolean} True if the field is valid, otherwise false.
 */
function validateField(field, value, errorId) {
  const errorElement = document.getElementById(errorId);
  if (!value) {
    field.classList.add("fieldIsRequired");
    errorElement.textContent = "This field is required";
    return false;
  }
  field.classList.remove("fieldIsRequired");
  errorElement.textContent = "";
  return true;
}

/**
 * Validates the category field and updates its error message.
 * @param {HTMLElement} categorySelect - The category select element.
 * @param {string} category - The selected category value.
 * @returns {boolean} True if the category is valid, otherwise false.
 */
function validateCategory(categorySelect, category) {
  const errorElement = document.getElementById("category-error");
  if (!category || category === "Select a category") {
    categorySelect.classList.add("fieldIsRequired");
    errorElement.textContent = "This field is required";
    return false;
  }
  categorySelect.classList.remove("fieldIsRequired");
  errorElement.textContent = "";
  return true;
}

/**
 * Retrieves the active priority from the buttons.
 * @returns {string} The active priority.
 */
function getActivePriority() {
  const buttons = document.querySelectorAll(".priority-buttons .priority");
  for (let btn of buttons) {
    if (btn.classList.contains("active-btn")) return btn.textContent.trim();
  }
  return "";
}

/**
 * Retrieves the assigned contacts from the checkboxes.
 * @returns {Array<Object>} The assigned contacts.
 */
function getAssignedContacts() {
  const checkboxes = document.querySelectorAll(".assign-checkbox");
  const contacts = [];
  checkboxes.forEach(cb => {
    if (cb.checked) {
      const contact = extractContactData(cb);
      if (contact) contacts.push(contact);
    }
  });
  return contacts;
}

/**
 * Extracts contact data from a checkbox element.
 * @param {HTMLElement} cb - The checkbox element.
 * @returns {Object|null} The extracted contact data or null if incomplete.
 */
function extractContactData(cb) {
  const { userId: id, userName: name, userEmail: email, userColor: color } = cb.dataset;
  if (!id || !name || !email || !color) {
    console.warn("Incomplete contact data:", { id, name, email, color });
    return null;
  }
  return { id, name, email, color };
}

/**
 * Retrieves the data of subtasks.
 * @returns {Array<Object>} The subtask data.
 */
function getSubtasksData() {
  return subtasks
    .filter((s) => s.name?.trim())
    .map((s) => ({ name: s.name, completed: false }));
}

/**
 * Clears and resets the task form.
 */
/**
 * Clears all input fields and resets the form to its initial state for adding a new task.
 * This includes clearing text fields, resetting dropdowns, removing active button states,
 * clearing assigned users and subtasks, and resetting error messages.
 */
function clearForm() {
  resetInputFields();
  resetPriorityButtons();
  resetCheckedChips();
  resetCategory();
  resetAllFieldErrors();
  updateSubtaskList();
}

/**
 * Resets all field errors for the form.
 */
function resetAllFieldErrors() {
  resetFieldAndError("title", "title-error");
  resetFieldAndError("due-date", "due-date-error");
  resetFieldAndError("categorySelect", "category-error");
}

function resetInputFields() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("due-date").value = "";
}

function resetPriorityButtons() {
  document
    .querySelectorAll(".priority")
    .forEach((btn) => btn.classList.remove("active-btn"));
  const mediumButton = document.querySelector(".priority.priority-medium");
  if (mediumButton) mediumButton.classList.add("active-btn");
}

function resetCheckedChips() {
  clearAssignedChips();
  clearSubtasks();
  clearSubtaskList();
  uncheckAllAssignCheckboxes();
}

function clearAssignedChips() {
  document.getElementById("assignedChips").innerHTML = "";
}

function clearSubtasks() {
  if (typeof subtasks !== "undefined") subtasks.length = 0;
}

function clearSubtaskList() {
  document.getElementById("subtask-list").innerHTML = "";
}

function uncheckAllAssignCheckboxes() {
  const checkboxes = document.querySelectorAll("input.assign-checkbox");
  checkboxes.forEach(checkbox => { checkbox.checked = false; });
}

function resetCategory() {
  document.getElementById("categorySelect").selectedIndex = 0;
}

/**
 * Resets the visual error indication and error message for a given input field.
 *
 * @param {string} fieldId - The ID of the input field to reset.
 * @param {string} errorId - The ID of the element displaying the error message.
 */
function resetFieldAndError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  if (field) field.classList.remove("fieldIsRequired");

  const errorElement = document.getElementById(errorId);
  if (errorElement) errorElement.textContent = "";
}

/**
 * Initializes the priority buttons.
 * @param {Document|HTMLElement} [scope=document] - The scope in which to search for buttons.
 */
function initPriorityButtons(scope = document) {
  priorityButtons = scope.querySelectorAll(".priority-buttons .priority");
  activePriorityButton = scope.querySelector(".priority.active-btn");
  priorityButtons.forEach((btn) => {
    btn.addEventListener("click", () => setPriority(btn));
  });
}

/**
 * Sets the priority based on the selected button.
 * @param {HTMLElement} button - The selected button.
 */
function setPriority(button) {
  activePriorityButton = button;
  priorityButtons.forEach((btn) => btn.classList.remove("active-btn"));
  button.classList.add("active-btn");
}

/**
 * Sets up the date picker for the task form.
 */
function setupDatePicker() {
  const dateInput = document.getElementById("due-date");
  if (!dateInput) return;
  const container = document.querySelector(".custom-date-input");

  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;

  const year = new Date().getFullYear();
  dateInput.max = `${year}-12-31`;

  if (container) {
    container.addEventListener("click", () => {
      if (dateInput.showPicker) dateInput.showPicker();
      else dateInput.focus();
    });
  }
}

/**
 * Adds event listeners to the form fields.
 */
function setupFieldListeners() {
  ["title", "due-date", "categorySelect"].forEach((id) => {
    const field = document.getElementById(id);
    if (!field) return;

    field.addEventListener("input", () => {
      field.classList.remove("fieldIsRequired");
      const err = document.getElementById(`${id}-error`);
      if (err) err.textContent = "";
    });
  });
}

/**
 * Deletes a task based on its ID.
 * @param {string} taskId - The ID of the task to delete.
 */
async function deleteTask(taskId) {
  await fetch(BASE_URL + `tasks/${taskId}.json`, { method: "DELETE" });
  closeOverlay();
  window.location.reload();
}

/**
 * Displays the confirmation template for deleting a task.
 * @param {Event} event - The triggering event.
 * @param {string} taskId - The ID of the task to delete.
 */
function showDeleteTemplate(event, taskId) {
  event.stopPropagation();
  const deleteOverlay = document.getElementById("dialogContainer");
  deleteOverlay.innerHTML = deleteConfirmTemplate(taskId);
}

/**
 * Closes the confirmation dialog.
 * @param {Event} event - The triggering event.
 */
function closeConfirmDialog(event) {
  if (event && event.target.id !== "confirmDialog") return;
  const deleteOverlay = document.getElementById("dialogContainer");
  deleteOverlay.innerHTML = "";
}

/**
 * Confirms the deletion of a task.
 * @param {string} taskId - The ID of the task to delete.
 */
function deleteTaskConfirmed(taskId) {
  deleteTask(taskId);
  closeConfirmDialog();
}

/**
 * Initializes the Add Task page on load.
 */
function initAddTaskPage() {

  initPriorityButtons();
  setupDatePicker();
  setupFieldListeners();
  setupTaskForm("todo");
  initAssignedDropdown().then((users) => updateAssignedChips(users));
}
document.addEventListener("DOMContentLoaded", initAddTaskPage);
