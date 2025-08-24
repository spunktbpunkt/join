/**
 * Generates the HTML template for the Add Task overlay.
 * @param {string} stage - The current stage of the task.
 * @returns {string} - The HTML string for the Add Task overlay.
 */
function addTaskOverlayTemplate(stage) {
  const subtasksHTML = subtasks
    .map((subtask, index) => subtasksTemplate(subtask, index))
    .join("");

  const today = new Date().toISOString().split('T')[0];

  return `
    <div class="task-overlay" id="taskOverlay" onclick="handleOverlayClick(event)">
      <div class="add-task-card ">
        <div class="task-header sticky-header">
          <h1>Add Task</h1>
          <button class="close-btn" onclick="closeOverlay()"><img src="../images/close.svg" alt="close"></button>
        </div>
        <div class="task-content">
          <section id="addTask">
            <div class="half-width addTask-left">
              <form class="forms" id="taskForm">
                <label for="title">Title<span> *</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter a title"
                  required
                />
                <span class="error-message" id="title-error"></span>
                <label for="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter a Description"
                  style="resize: none"
                  spellcheck="false"
                ></textarea>
                <span class="error-message" id="description-error"></span>
                <label for="due-date">Due date<span> *</span></label>
                <div class="custom-date-input">
                  <input type="date" id="due-date" name="due-date" required min="${today}" />
                  <img src="../images/calendar.svg" alt="Calendar Icon" />
                </div>
                <span class="error-message" id="due-date-error"></span>
              </form>
            </div>
            <div class="separator"></div>
            <div class="half-width addTask-right">
              <label class="right-label">Priority</label>
              <div class="priority-buttons">
                <button type="button" class="priority priority-urgent" onclick="setPriority(this)">
                  Urgent
                  <img src="../images/urgent.svg" alt="Urgent" />
                </button>
                <button type="button" class="priority priority-medium active-btn" onclick="setPriority(this)">
                  Medium
                  <img src="../images/medium.svg" alt="Medium" />
                </button>
                <button type="button" class="priority priority-low" onclick="setPriority(this)">
                  Low
                  <img src="../images/low.svg" alt="Low" />
                </button>
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
                  <span class="error-message" id="assigned-error"></span>
                  <div
                    class="dropdown-options"
                    id="assignedDropdownOptions"
                  ></div>
                </div>
              </div>
              <div class="assigned-chips" id="assignedChips"></div>
              <div>
                <label class="right-label">Category<span> *</span></label>
                <div class="custom-select-container">
                  <select id="categorySelect">
                    <option disabled selected>Select a category</option>
                    <option>Technical Task</option>
                    <option>User Story</option>
                  </select>
                  <img
                    src="../images/arrow_drop_down.svg"
                    alt=""
                    class="select-icon"
                  />
                </div>
                <span class="error-message" id="category-error"></span>
              </div>
              <!-- Subtask Section -->
              <div>
                <label class="right-label">Subtasks</label>
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
                <div id="subtask-list">
                ${subtasksHTML}
                </div>
              </div>
            </div>
          </section>
                              <label class="required-label-overlay"><span>*</span>This field is required</label>

        </div>

        <div class="create-task-footer overlay-footer">

          <div class="form-actions">
            <div class="close-btn-container">
              
                  <button class="close-btn-footer" onclick="closeOverlay()"><span>Cancel<span></button>
             
            </div>
            <div class="create-btn-container">
              <button
                id="create-task-btn"
                onclick="createTask('${stage}')"
                type="button"
                class="create-task-btn"
              >
                Create Task
                <img src="../images/check.svg" alt="create icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}