/**
 * Neues Overlay-Template für den Edit-Modus
 * @param {Object} task - Task-Daten aus Firebase
 * @param {Array} users - Liste aller User für Dropdown/Chips
 */
function editTaskOverlayTemplate(task) {
  const subsHTML = (
    Array.isArray(task.subtasks)
      ? task.subtasks
      : Object.values(task.subtasks) || []
  )
    .map((s, i) => subtasksTemplate(s, i))
    .join("\n");

  const p = (level) =>
    task.priority.toLowerCase() === level.toLowerCase() ? "active-btn" : "";

  const today = new Date().toISOString().split("T")[0];
  return `
<div class="task-overlay" id="taskOverlay" onclick="handleOverlayClick(event)">
  <div class="add-task-card edit-mode">
    <div class="task-header sticky-header">
      <div class="user-story-label task-category">Edit Task</div>
      <button class="close-btn" onclick="closeOverlay()">
        <img src="../images/close.svg" alt="close">
      </button>
    </div>
    <div class="task-content">
      <h1>Edit Task</h1>
      <section class="edit-task" class="vertical-layout">
        <div class="half-width addTask-left-edit">
          <form class="forms" id="taskForm">
            <label for="title">Title<span>*</span></label>
            <input type="text" id="title" name="title" required value="${
              task.title
            }" />
              <span id="title-error" class="error-msg"></span>
            <label for="description">Description</label>
            <textarea id="description" name="description" style="resize: none; max-height: 300px; max-width: 500px; min-height= 500px" spellcheck="false">${
              task.description
            }</textarea>
             <span id="description-error" class="error-msg"></span>
            <label for="due-date">Due date<span>*</span></label>
            <div class="custom-date-input">
              <input type="date" id="due-date" name="due-date"  required min="${today}" value="${
    task.dueDate || ""
  }"/>
              <img src="../images/calendar.svg" alt="Calendar Icon" />
              <span id="due-date-error" class="error-msg"></span>
            </div>
          </form>
        </div>
        <div class="separator"></div>
        <div class="half-width addTask-right-edit">
          <h3>Priority</h3>
          <div class="priority-buttons">
            <button type="button" class="priority priority-urgent ${p(
              "Urgent"
            )}" onclick="setPriority(this)">Urgent <img src="../images/urgent.svg" /></button>
            <button type="button" class="priority priority-medium ${p(
              "Medium"
            )}" onclick="setPriority(this)">Medium <img src="../images/medium.svg" /></button>
            <button type="button" class="priority priority-low ${p(
              "Low"
            )}" onclick="setPriority(this)">Low <img src="../images/low.svg" /></button>
          </div>

          <div>
                <label class="right-label">Assigned to</label>
                <div class="custom-assigned-dropdown" id="assignedDropdown">
                  <div class="dropdown-selected" id="assignedDropdownSelected">
                    Select contacts to assign
                    <img
                      src="../images/arrow_drop_down.svg"
                      alt="Dropdown Icon"
                      class="select-icon"
                    />
                  </div>
                  <div
                    class="dropdown-options"
                    id="assignedDropdownOptions"
                  ></div>
                </div>
              </div>
              <div class="assigned-chips" id="assignedChips"></div>

          <h3 class="d-none">Category<span>*</span></h3>
          <div class="custom-select-container">
            <select class="d-none" id="categorySelect">
              <option disabled>Select a category</option>
              <option ${
                task.category === "User Story" ? "selected" : ""
              }>User Story</option>
              <option ${
                task.category === "Technical Task" ? "selected" : ""
              }>Technical Task</option>
            </select>
            <img src="../images/arrow_drop_down.svg" alt="" class="select-icon d-none"/>
            <span id="category-error" class="error-msg"></span>
          </div>

          <h3>Subtasks</h3>
          <div class="subtask-input">
                  <input
                    type="text"
                    id="subtask-input"
                    placeholder="Add new subtask"
                    onclick="activateSubtaskInput()"
                    autocomplete="off"
                    maxlength="35"
                  />
                  <div class="subTask-icons">
                    <img
                      onclick="confirmSubtaskEntry()"
                      id="check-subtask-icon"
                      src="../images/checkDark.svg"
                      alt="Confirm"
                      class="subtask-icon-check d-none select-icon"
                    />
                    <img
                      id="close-subtask-icon"
                      src="../images/close.svg"
                      alt="Cancel"
                      class="subtask-icon d-none select-icon"
                    />
                  </div>
                  <div class="seperator d-none" id="seperator"></div>

                  <img
                    id="add-icon"
                    src="../images/addDark.svg"
                    alt="subtask-icon"
                    class="select-icon"
                  />
                </div>
          <div id="subtask-list" class="subtask-list">
            ${subsHTML}
          </div>
        </div>
      </section>
    </div>
    <div class="create-task-footer">
      <div class="form-actions-edit">
       <button id="save-task-btn" type="button" class="create-task-btn">Ok <img src="../images/check.svg" /></button>
      </div>
    </div>
  </div>
</div>
`;
}
