let allTasksSearch = {};
let currentSearchTerm = "";

const searchInput = document.getElementById("taskSearch");

const boardMain = document.getElementById("mainContent");
const boardContent = document.getElementById("boardContent");

const toDo = document.getElementById("toDo");
const inProgress = document.getElementById("inProgress");
const awaitFeedback = document.getElementById("awaitFeedback");
const done = document.getElementById("done");


/**
 * Sets focus on the search input field and initializes the task search.
 */
function focusSearchInput() {
  searchInput.focus();

  if (currentSearchTerm.length >= 3) {
    return;
  }
  initializeTaskSearch();
}

/**
 * Handles the input event for the search input field.
 * Updates the current search term and renders tasks based on the input.
 */
function handleSearchInput() {
  const query = searchInput.value.trim().toLowerCase();
  currentSearchTerm = query;
  if (query.length === 0) {
    renderFilteredTasks();
  } else if (query.length >= 3) {
    renderFilteredTasks(query);
  }
}

/**
 * Initializes the task search functionality on the board.
 * Loads all tasks if not already loaded, renders filtered tasks based on the current search input,
 * and sets up an event listener to filter tasks as the user types.
 *
 * @async
 * @function initializeTaskSearch
 * @returns {Promise<void>} Resolves when the search initialization and first render are complete.
 */
async function initializeTaskSearch() {
  if (!searchInput) return;

  if (Object.keys(allTasksSearch).length === 0) {
    allTasksSearch = await loadData("tasks");
  }

  renderFilteredTasks(searchInput.value.trim().toLowerCase());

  searchInput.addEventListener("input", handleSearchInput);
}


/**
 * Renders tasks filtered by a search term onto the board.
 * Clears existing tasks from the board and repopulates it with tasks matching the search criteria.
 * If no search term is provided, all tasks are displayed.
 *
 * @async
 * @param {string} [searchTerm] - The term to filter tasks by.
 *                                If empty or null, all tasks are displayed.
 */
function renderFilteredTasks(searchTerm = "") {
  const allTaskElements = document.querySelectorAll(".task");

  allTaskElements.forEach((taskElement) => {
    const taskId = taskElement.dataset.taskId;
    const task = allTasksSearch[taskId];

    if (!task) return;

    const matches = !searchTerm || taskMatchesSearch(task, searchTerm);
    taskElement.style.display = matches ? "block" : "none";
  });

  // optional: leere-Column-Hinweise aktualisieren
  insertNoTaskPlaceholders();
}

  /**
   * Checks if a task matches a search term.
   * Compares the term with the task's title, description, due date,
   * category, priority, or assigned users.
   *
   * @param {Object} task - The task object to check.
   * @param {string} term - The search term to compare against the task.
   * @returns {boolean} Returns `true` if the task matches the search term, otherwise `false`.
   */
  function taskMatchesSearch(task, term) {
    const title = task.title?.toLowerCase() || "";
    const description = task.description?.toLowerCase() || "";
    const dueDate = task.dueDate?.toLowerCase() || "";
    const category = task.category?.toLowerCase() || "";
    const priority = task.priority?.toLowerCase() || "";
    const assigned = Array.isArray(task.assignedTo)
      ? task.assignedTo.some((user) => user.name?.toLowerCase().includes(term))
      : false;

    return (
      title.includes(term) ||
      description.includes(term) ||
      dueDate.includes(term) ||
      category.includes(term) ||
      priority.includes(term) ||
      assigned
    );
  }

  function insertNoTaskPlaceholders() {
  [toDo, inProgress, awaitFeedback, done].forEach((column) => {
    let placeholder = column.querySelector(".noTasks");

    if (!placeholder) {
      placeholder = document.createElement("div");
      placeholder.classList.add("noTasks");
      placeholder.innerText = "No tasks to do";
      column.appendChild(placeholder);
    }

    const visibleTasks = column.querySelectorAll(".task:not([style*='display: none'])");
    placeholder.style.display = visibleTasks.length === 0 ? "flex" : "none";
  });
}

  
  /**
   * Appends the HTML representation of a task to the specified stage in the DOM.
   *
   * @param {number} stage - The stage to which the task should be added.
   *                         Valid values are:
   *                         0 - "To Do"
   *                         1 - "In Progress"
   *                         2 - "Awaiting Feedback"
   *                         3 - "Done".
   * @param {string} html - The HTML string representing the task to be added.
   */
  function appendTaskToStage(stage, html) {
    switch (stage) {
      case 0:
        document.getElementById("toDo").innerHTML += html;
        break;
      case 1:
        document.getElementById("inProgress").innerHTML += html;
        break;
      case 2:
        document.getElementById("awaitFeedback").innerHTML += html;
        break;
      case 3:
        document.getElementById("done").innerHTML += html;
        break;
      default:
        break;
    }
  }
