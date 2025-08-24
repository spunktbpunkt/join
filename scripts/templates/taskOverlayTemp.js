/**
 * Generates the HTML markup for a task overlay displaying detailed information about a task,
 * including its category, title, description, due date, priority, assignees, and subtasks.
 *
 * @param {Object} task - The task object containing all relevant task data.
 * @param {string} [task.id] - The unique identifier for the task.
 * @param {string} [task.category] - The category of the task.
 * @param {string} [task.title] - The title of the task.
 * @param {string} [task.description] - The description of the task.
 * @param {string} [task.dueDate] - The due date of the task in 'YYYY-MM-DD' format.
 * @param {string} [task.priority] - The priority level of the task (e.g., 'Low', 'Medium', 'High').
 * @param {Array|Object} [task.subtasks] - The subtasks associated with the task, as an array or object.
 * @param {Array} [task.assignedTo] - The list of users assigned to the task.
 * @returns {string} The HTML string representing the task overlay.
 */
function generateTaskOverlay(task) {
  const subs = Array.isArray(task.subtasks)
    ? task.subtasks
    : typeof task.subtasks === "object"
    ? Object.values(task.subtasks)
    : [];

  const subtasksOverlayHTML = subs
    .map((subtask, idx) => taskOverlaySubtaskTemplate(subtask, idx))
    .join("");

  const assigneesHTML = taskOverlayAssignee(task.assignedTo || []);

  const subtasksSection =
    subs.length > 0
      ? `
    <div class="subtasks-section">
      <span class="detail-label">Subtasks</span>
      <div id="subtask-list" class="subtask-list">
        ${subtasksOverlayHTML}
      </div>
    </div>
  `
      : "";

  return `
    <div class="task-overlay" id="taskOverlay" onclick="handleOverlayClick(event)">
      <div class="task-card-overlay">
        <div class="task-header">
          <div class="task-category ${
            task.category ? task.category.toLowerCase().replace(" ", "-") : ""
          }">
          <span>${task.category || ""}</span>
          </div>
          <button class="close-btn" onclick="closeOverlay()">
            <img src="../images/close.svg" alt="Close">
          </button>
        </div>
        <div class="task-content">
          <h2 class="task-title">${task.title || ""}</h2>
          <p class="task-description">${task.description || ""}</p>
          <div class="task-details">
            <div class="detail-row">
              <span class="detail-label">Due date:</span>
              <span class="detail-value">${
                task.dueDate ? task.dueDate.replace(/-/g, "/") : ""
              }</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Priority:</span>
              <div class="task-priority ${
                task.priority ? task.priority.toLowerCase() : ""
              }">
                ${task.priority || "Low"} &nbsp;
                <img src="../images/${
                  task.priority ? task.priority.toLowerCase() : "low"
                }.svg"
                     alt="${task.priority || "Low"}">
              </div>
            </div>
            <div class="detail-row assigned-to">
              <span class="detail-label">Assigned To:</span>
              <div class="assignee-list">
                ${assigneesHTML}
              </div>
            </div>
          </div>
          ${subtasksSection}
        </div>
        <div class="task-actions">
          <button class="action-btn delete-btn" onclick="showDeleteTemplate(event, '${task.id}')">
            <img src="../images/subtaskBin.svg" alt="Delete">
            <span>Delete</span>
          </button>
          <div class="action-separator"></div>
          <button class="action-btn edit-btn" onclick="closeOverlay(); setTimeout(() => showEditTaskOverlay('${task.id}'), 150)">
            <img src="../images/edit-2.svg" alt="Edit">
            <span>Edit</span>
          </button>
        </div>
      </div>
    </div>
  `;
}


/**
 * Generates an HTML template string for a confirmation dialog to delete a task.
 *
 * @param {string} taskId - The unique identifier of the task to be deleted.
 * @returns {string} The HTML string for the delete confirmation dialog.
 */
function deleteConfirmTemplate(taskId) {
  return `
    <div id="confirmDialog" class="confirm-dialog-overlay" onclick="closeConfirmDialog(event)">
      <div class="confirm-dialog" onclick="event.stopPropagation()">
        <h3>Delete permanently?</h3>
        <div class="confirm-buttons">
          <button class="close-btn-footer " onclick="closeConfirmDialog()">Cancel</button>
          <button class="close-btn-footer " onclick="deleteTaskConfirmed('${taskId}')">Delete</button>
        </div>
      </div>
    </div>
  `;
}