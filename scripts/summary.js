/**
 * Initializes the summary page by loading task counts and displaying the help popup.
 * @async
 * @function init
 * @returns {Promise<void>} Resolves when the initialization is complete.
 */
async function init() {
  fillUserLinks();
  await loadAndDisplayTaskCounts();
  addHelpToPopup();
}

init();

/**
 * Asynchronously loads tasks, counts them by status, updates the DOM elements, and makes the page visible.
 * @async
 * @function loadAndDisplayTaskCounts
 * @returns {Promise<void>} Resolves when task counts are loaded and displayed.
 */
async function loadAndDisplayTaskCounts() {
  try {
    const tasks = await loadData("tasks");
    const counts = countTasks(tasks);

    document.getElementById("allTasks").textContent = counts.all;
    document.getElementById("toDoTasks").textContent = counts.toDo;
    document.getElementById("inProgressTasks").textContent = counts.inProgress;
    document.getElementById("awaitingFeedbackTasks").textContent = counts.awaitFeedback;
    document.getElementById("doneTasks").textContent = counts.done;
    document.getElementById("urgentTasks").textContent = counts.urgent;
  } catch (error) {
    console.error("Fehler beim Laden der Tasks:", error);
  }

  bodyVisible();
}


/**
 * Makes the body of the page visible after Firebase authentication is complete.
 * @function bodyVisible
 */
function bodyVisible() {
  document.body.style.visibility = "visible";
}

/**
 * Maps the `stage` numbers to their corresponding categories.
 * @function getStageDescription
 * @param {number} stage - The stage number of the task.
 * @returns {string} The description of the stage.
 */
function getStageDescription(stage) {
  switch (stage) {
    case 0:
      return "To Do";
    case 1:
      return "In Progress";
    case 2:
      return "Awaiting Feedback";
    case 3:
      return "Done";
    default:
      return "Unknown";
  }
}

/**
 * Counts tasks by stage and priority.
 * @function countTasks
 * @param {Object} tasksObj - The object returned by `loadData('tasks')`.
 * @returns {{all: number, toDo: number, inProgress: number, awaitFeedback: number, done: number, urgent: number}} An object containing task counts by category.
 */
function countTasks(tasksObj) {
  const counts = {
    all: 0,
    toDo: 0,
    inProgress: 0,
    awaitFeedback: 0,
    done: 0,
    urgent: 0,
  };

  if (!tasksObj) return counts;
  Object.values(tasksObj).forEach((task) => {
    counts.all++;
    switch (task.stage) {
      case 0:
        counts.toDo++;
        break;
      case 1:
        counts.inProgress++;
        break;
      case 2:
        counts.awaitFeedback++;
        break;
      case 3:
        counts.done++;
        break;
    }
    if (task.priority && task.priority.toLowerCase() === "urgent") {
      counts.urgent++;
    }
  });

  return counts;
}

document.addEventListener("DOMContentLoaded", function () {
  setCurrentDate();
  setGreeting();
});


/** Zeigt das aktuelle Datum an. */
/**
 * Displays the current date in the format 'Month Day, Year'.
 * @function setCurrentDate
 */
function setCurrentDate() {
  const currentDate = new Date();
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('de-DE', options);

  const dateElement = document.getElementById("current-date");
  if (dateElement) {
    dateElement.innerText = formattedDate;
  }
}


window.addEventListener("load", () => {
  setGreeting();

  const box = document.getElementById("greetingScreen");
  if (box && window.innerWidth <= 1000) {
    box.classList.add("fullscreen");
    setTimeout(() => {
      box.classList.remove("fullscreen");
    }, 2000);
  }
});


/**
 * Sets the greeting message based on the time of day and the user's name.
 * @function setGreeting
 */
function setGreeting() {
  const name = localStorage.getItem("name");
  const h = new Date().getHours();
  let greeting =
    h >= 18 || h < 5 ? "Good evening" :
      h >= 12 ? "Good afternoon" :
        "Good morning";

  const punctuation = (name === "sofiam@gmail.com") ? "!" : ",";
  document.getElementById("greeting").textContent = greeting + punctuation;
}