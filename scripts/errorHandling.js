/**
 * displays an error if required fields are not filled
 *
 * @param {HTMLElement} parentElement
 * @param {HTMLElement} element
 * @param {String} elementText
 */
function showError(parentElement, element, elementText) {
  parentElement = document.getElementById(parentElement);
  element = document.getElementById(element);
  if (element) {
    element.innerHTML =
      elementText || "You're not approved to<br> perform this action.";
    element.classList.add("visible"); // Sicherstellen, dass die Fehlermeldung sichtbar ist

    try {
      if (parentElement) {
        parentElement.classList.add("redBorder");
      }
    } catch (error) {
      console.error("Error adding redBorder to parentElement:", error);
    }
  }
}

function hideError(parentElement, element) {
  parentElement = document.getElementById(parentElement);
  element = document.getElementById(element);
  try {
    parentElement.classList.remove("redBorder");
  } catch (error) {}
  try {
    element.classList.remove("visible");
  } catch (error) {}
  try {
    element.innerHTML = "";
  } catch (error) {}
}

/**
 * checks if the name field is filled and meets requirements
 *
 * @param {String} elementId
 */
function checkName(elementId) {
  const input = document.getElementById(elementId);
  const errorSpanId = elementId.replace("Input", "ErrorSpan");
  const rightBtn = document.getElementById("rightBtn");

  const isEmpty = input.value.trim() === "";
  const isEmail = elementId === "emailInputContact";
  const isEmailValid = isEmail && !emailIsValid(input.value);

  if (isEmpty) {
    showError(elementId, errorSpanId, "This input field must be filled.");
    rightBtn.disabled = true;
    return;
  }

  if (isEmailValid) {
    showError(elementId, errorSpanId, "Email address is not valid.");
    rightBtn.disabled = true;
    return;
  }

  hideError(elementId, errorSpanId);
  rightBtn.disabled = false;
}

/**
 * validates name field input when Enter key is pressed
 *
 * @param {Event} event
 * @param {String} id
 */
function checkEnter(event, id) {
  if (event.key === "Enter") {
    checkName(id);
  }
}

function validateEmpty(inputId, errorSpanId) {
  const input = document.getElementById(inputId);
  if (input.value.trim() === "") {
    showError(inputId, errorSpanId, "This input field must be filled.");
    return false;
  } else {
    hideError(inputId, errorSpanId);
    return true;
  }
}

/**
 * validates the input of the email inputfield
 *
 * @param {String} inputId
 * @param {String} errorSpanId
 */
function validateEmail(inputId, errorSpanId) {
  const input = document.getElementById(inputId);
  if (!validateEmpty(inputId, errorSpanId)) return false;

  if (!emailIsValid(input.value)) {
    showError(inputId, errorSpanId, "Email address is not valid.");
    return false;
  } else {
    hideError(inputId, errorSpanId);
    return true;
  }
}

/**
 * shows visual feedback if field inputs are not valid
 *
 * @param {String} inputId
 * @param {String} errorSpanId
 * @param {Boolean} isEmail
 * @param {Event} onEnter
 */
function addValidationEvents(inputId,errorSpanId,isEmail = false,onEnter = null) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener("blur", () => {
    isEmail
      ? validateEmail(inputId, errorSpanId)
      : validateEmpty(inputId, errorSpanId);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const valid = isEmail
        ? validateEmail(inputId, errorSpanId)
        : validateEmpty(inputId, errorSpanId);
      if (valid && onEnter) onEnter();
    }
  });
}

addValidationEvents("nameInput", "nameErrorSpan");
addValidationEvents("emailInput", "emailErrorSpan", true);
addValidationEvents("passwordInput", "passwordErrorSpan", false, () => {
  const blueBtn = document.querySelector(".blueBtn");
  if (blueBtn) blueBtn.click();
});
addValidationEvents(
  "confirmPasswordInput",
  "confirmPasswordErrorSpan",
  false,
  typeof createAccount === "function" ? createAccount : null
);

confirmPasswordInput = document.getElementById("confirmPasswordInput");
if (confirmPasswordInput) {
  confirmPasswordInput.addEventListener("blur", function () {
    showLockIconCreateAccount(this.id);
  });
}

nameInput = document.getElementById("nameInput");
emailInput = document.getElementById("emailInput");
passwordInput = document.getElementById("passwordInput");
confirmPasswordInput = document.getElementById("confirmPasswordInput");
