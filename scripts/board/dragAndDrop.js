/**
 * Tracks the container from which a task is being dragged.
 * @type {HTMLElement | null}
 */
let draggedFromContainer = null;

/**
 * Sets up drag-and-drop functionality and event listeners for buttons.
 */
function setupDragDrop() {
  const containers = document.querySelectorAll("#boardContent .task-list");
  containers.forEach(setupDropZone);

  const addTaskBtn = document.getElementById("addTaskBtn");
  if (addTaskBtn)
    addTaskBtn.addEventListener("click", () => showAddTaskOverlay("add"));
}

/**
 * Configures a container as a drop zone for drag-and-drop operations.
 * @param {HTMLElement} container - The container to set up as a drop zone.
 */
function setupDropZone(container) {
  container.addEventListener("dragover", handleDragOver);
  container.addEventListener("drop", (e) => handleDrop(e, container));
  setupContainerHighlighting(container);
}

/**
 * Handles the dragover event to allow dropping.
 * @param {DragEvent} e - The dragover event.
 */
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

/**
 * Handles the drop event to update the task's stage and apply visual effects.
 * @param {DragEvent} e - The drop event.
 * @param {HTMLElement} container - The container where the task is dropped.
 */
function handleDrop(e, container) {
  e.preventDefault();
  container.classList.remove("highlight-container");

  const rawId = e.dataTransfer.getData("text/plain");
  const taskId = rawId.replace("task", "");

  updateStage(container, taskId);

  setTimeout(() => {
    const newTask = document.getElementById(rawId);
    if (newTask) {
      newTask.scrollIntoView({ behavior: "smooth", block: "center" });
      dropHighlight(newTask);
    }
  }, 400);
  draggedFromContainer = null;
}

/**
 * Makes tasks draggable and sets up dragstart event listeners.
 */
function addDragFunction() {
  const tasks = document.querySelectorAll(".task");
  tasks.forEach((task) => {

    task.setAttribute("draggable", "true");
    task.addEventListener("dragstart", function (e) {
      e.dataTransfer.setData("text/plain", task.id);
      e.dataTransfer.effectAllowed = "move";
      draggedFromContainer = task.closest(".task-list");
      dragAnimation(task);
    });
    setupTouchStart(task);
    setupTouchMove(task);
    setupTouchEnd(task);
  });
}

/**
 * opens the overlay to move the tapped task to a different section
 * @param {Event} e
 * @param {String} taskId
 */
function openDragOverlay(e, taskId) {
  const mobileActions = document.getElementById("mobileTaskActions");
  if (mobileActions) {
    mobileActions.remove();
  }
  const task = document.getElementById(taskId);

  task.innerHTML += mobileActionsTemplate();
  document.addEventListener("click", function (e) {
    const mobileActions = document.getElementById("mobileTaskActions");
    if (mobileActions && !mobileActions.contains(e.target)) {
      mobileActions.remove();
    }
  });
  e.stopPropagation();
}

/**
 * Adds a drag animation to a task during dragstart.
 * @param {HTMLElement} task - The task element.
 */
function dragAnimation(task) {
  task.style.transform = "rotate(3deg)";
  task.style.transition = "transform 0.2s";

  task.addEventListener("dragend", function resetRotation() {
    task.style.transform = "rotate(0deg)";
    task.removeEventListener("dragend", resetRotation);
  });
}

/**
 * Highlights a task element after it is dropped.
 * @param {HTMLElement} taskElement - The task element to highlight.
 */
function dropHighlight(taskElement) {
  taskElement.classList.add("task-dropped");

  setTimeout(() => {
    taskElement.classList.remove("task-dropped");
  }, 500);
}

/**
 * Processes mobile input to update the stage of a task.
 * @param {string} containerId - The ID of the container to move the task to.
 */
function processMobileInput(containerId) {
  const container = document.getElementById(containerId);
  const mobileActions = document.getElementById("mobileTaskActions");
  const taskId = mobileActions.parentElement.id.replace("task", "");
  updateStage(container, taskId);
  mobileActions.remove();
}

/**
 * Sets up touch and drag events for mobile devices.
 * @param {HTMLElement} task - The task element.
 */
function setupTouchStart(task) {
  task.addEventListener(
    "touchstart",
    function (e) {
      const mobileActions = document.getElementById("mobileTaskActions");
      if (mobileActions && !mobileActions.contains(e.target)) {
        mobileActions.remove();
      }
    },
    { passive: true }
  );
}

function setupTouchEnd(task) {
  task.addEventListener("touchend", function () {
    clearTimeout(task._pressTimer);
  });
}

function setupTouchMove(task) {
  task.addEventListener("touchmove", function () {
    clearTimeout(task._pressTimer);
  });
}

function setupContainerHighlighting(container) {
  let dragCounter = 0;
  container.addEventListener("dragenter", function () {
    dragCounter++;
    if (container !== draggedFromContainer) container.classList.add("highlight-container");
  });
  container.addEventListener("dragleave", function () {
    dragCounter--;
    if (dragCounter === 0) container.classList.remove("highlight-container");
  });
  container.addEventListener("dragend", function () {
    dragCounter = 0;
    container.classList.remove("highlight-container");
  });
}
