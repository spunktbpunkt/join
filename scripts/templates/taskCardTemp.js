/**
 * Generates an HTML string representing a task card for the given task object.
 *
 * @param {Object} task - The task object containing task details.
 * @param {number|string} task.id - The unique identifier for the task.
 * @param {string} [task.category] - The category of the task.
 * @param {string} [task.title] - The title of the task.
 * @param {string} [task.description] - The description of the task.
 * @param {string} [task.priority] - The priority level of the task (e.g., "Low", "Medium", "High").
 * @param {Array<Object>} [task.assignedTo] - The list of users assigned to the task.
 * @returns {string} The HTML markup for the task card.
 */
function generateTaskCard(task) {
  const { completedSubtasks: done, totalSubtasks: total, progressPercentage } = checkSubProgress(task);

  const maxLen = 40;
  const desc = task.description || "";
  const shortDesc = desc.length > maxLen 
    ? desc.slice(0, maxLen) + "…" 
    : desc;

  const stateCls = (total > 0 && done === total) ? 'all-done' : 'not-done';

  const subtasksSection = total > 0 ? `
    <div class="task-subtasks">
      <div class="subtask-progress-container">
        <div class="subtask-progress-bar" style="width: ${progressPercentage}%"></div>
      </div>
      <span class="subtask-count ${stateCls}">
        ${done}/${total} Subtasks
      </span>
    </div>
  ` : "";

  return `
    <div id="task${task.id}" data-task-id="${task.id}" tabindex="0" class="task" draggable="true"
         onclick="showTaskOverlayById('${task.id}')">
      <div class="task-category ${
        task.category ? task.category.toLowerCase().replace(" ", "-") : ""
      }">
        <span>${task.category || ""}</span>
        <button onclick="openDragOverlay(event, this.parentElement.parentElement.id)"></button>
      </div>
      <h3 class="task-title">${task.title || ""}</h3>
      <p class="task-description">${shortDesc}</p>
      <div class="task-footer">
        ${subtasksSection}
        <div class="task-bottom-info">
          <div class="task-assignees">
            ${generateCardAssigneeHTML(task.assignedTo)}
          </div>
          <div class="task-priority ${
            task.priority ? task.priority.toLowerCase() : ""
          }">
            <img src="../images/${
              task.priority ? task.priority.toLowerCase() : "low"
            }.svg"
                 alt="${task.priority || "Low priority"}">
          </div>
        </div>
      </div>
    </div>
  `;
}

function columnBtnTemplate(label, key) {
  return `
    <div class="column-header">
      <span>${label}</span>
      <button id="${key}Btn"
              class="add-task"
              onclick="showAddTaskOverlay('${key}')">
      </button>
    </div>
  `;
}

function mobileActionsTemplate() {
  return `
    <div id="mobileTaskActions" onclick="event.stopPropagation()">
      <h4>Move To</h4>
      <ul>
        <li onclick="processMobileInput('toDo')">To Do</li>
        <li onclick="processMobileInput('inProgress')">In Progess</li>
        <li onclick="processMobileInput('awaitFeedback')">Await Feedback</li>
        <li onclick="processMobileInput('done')">Done</li>
      </ul>
    </div>
  `;
}