/**
 * Generates an HTML template string for a single subtask item.
 *
 * @param {Object} subtask - The subtask object containing subtask details.
 * @param {string} subtask.name - The name or description of the subtask.
 * @param {number} index - The index of the subtask in the list.
 * @returns {string} The HTML string representing the subtask item.
 */
function subtasksTemplate(subtask, index) {
  return `
        <div class="subtask-item" data-subtask-index="${index}">
            <p class="subtask-text">• ${subtask.name}</p>
            <div class="subtask-icons">
                <img src="../images/edit-2.svg" alt="Edit" class="subtask-icon edit-subtask" data-index="${index}">
                <div class="vertical-line-subtask-dark"></div>
                <img src="../images/subtaskBin.svg" alt="Delete" class="subtask-icon delete-subtask" data-index="${index}">
            </div>
        </div>
    `;
}



/**
 * Generates an HTML template string for a subtask checkbox element.
 *
 * @param {Object} subtask - The subtask object containing its properties.
 * @param {string} subtask.name - The name or label of the subtask.
 * @param {boolean} subtask.completed - Indicates if the subtask is completed.
 * @param {number} index - The index of the subtask in the list.
 * @returns {string} The HTML string representing the subtask checkbox and label.
 */
function taskOverlaySubtaskTemplate(subtask, index) {
  const iconSrc = subtask.completed
    ? '../images/checkboxtrueblack.svg'
    : '../images/checkboxfalseblack.svg';
  const altText = subtask.completed ? 'Completed' : 'Incomplete';

  return `
    <div class="subtask-checkbox-container">
      <img
        src="${iconSrc}"
        alt="${altText}"
        class="subtask-checkbox-icon"
        onclick="toggleSubtaskCompletion(${index})"
      />
      <p for="subtask-${index}" class="subtask-label">${subtask.name}</p>
    </div>
  `;
}