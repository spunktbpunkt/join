let chkboxPrivacy = ""
let privacyBoolean = ""
let userName = ""
let email = ""
let password = ""
let confirmPassword = ""


/**
 * Initializes the create account process by loading data from Firebase.
 */
function initCreateAccount() {
    loadFromFirebase();
}

/**
 * Handles the account creation process, including validation and data submission.
 * Uses helper functions to validate inputs, check email availability, and finalize account creation.
 */
async function createAccount() {
    const userInputs = getUserInputs();
    const { email, password, confirmPassword, userName, privacyBoolean } = userInputs;

    if (await isEmailTaken(email)) return showError("emailInput", "emailErrorSpan", "Account with this Email already exists.");

    if (!arePasswordsMatching(password, confirmPassword)) return handlePasswordMismatch();

    if (!areInputsValid(userInputs)) return;

    if (isAccountCreatable(userInputs)) {
        const nextColor = await lastColor();
        await postData("login", { name: userName, email, password, color: nextColor, phone: '', type: "login" });
        await finalizeAccountCreation();
    }
}

/**
 * Retrieves user input values from the form fields.
 * @returns {Object} An object containing user input values.
 */
function getUserInputs() {
    return {
        email: document.getElementById("emailInput").value,
        password: document.getElementById("passwordInput").value,
        confirmPassword: document.getElementById("confirmPasswordInput").value,
        userName: document.getElementById("nameInput").value,
        privacyBoolean: document.getElementById("acceptPrivacyPolicy").src.includes("true")
    };
}

/**
 * Checks if the provided email is already associated with an existing account.
 * @param {string} email - The email to check.
 * @returns {Promise<boolean>} True if the email is taken, false otherwise.
 */
async function isEmailTaken(email) {
    return await findUser(email) !== null;
}

/**
 * Validates if the provided passwords match.
 * @param {string} password - The password entered by the user.
 * @param {string} confirmPassword - The confirmation password entered by the user.
 * @returns {boolean} True if the passwords match, false otherwise.
 */
function arePasswordsMatching(password, confirmPassword) {
    return password === confirmPassword;
}

/**
 * Handles the case where passwords do not match by displaying error messages.
 */
function handlePasswordMismatch() {
    showError("passwordInput", "passwordErrorSpan", "Passwords don't match.");
    showError("confirmPasswordInput", "confirmPasswordErrorSpan", "Passwords don't match.");
}

/**
 * Validates the user inputs for required fields.
 * @param {Object} inputs - The user inputs to validate.
 * @returns {boolean} True if all inputs are valid, false otherwise.
 */
function areInputsValid({ email, password, confirmPassword, userName }) {
    let isValid = true;
    if (!password) isValid = showError("passwordInput", "passwordErrorSpan", "Cannot be empty.") && false;
    if (!confirmPassword) isValid = showError("confirmPasswordInput", "confirmPasswordErrorSpan", "Cannot be empty.") && false;
    if (!userName) isValid = showError("nameInput", "nameErrorSpan", "Cannot be empty.") && false;
    if (!email) isValid = showError("emailInput", "emailErrorSpan", "Cannot be empty.") && false;
    return isValid;
}

/**
 * Checks if the account can be created based on the provided inputs.
 * @param {Object} inputs - The user inputs to check.
 * @returns {boolean} True if the account can be created, false otherwise.
 */
function isAccountCreatable({ email, password, privacyBoolean, userName }) {
    return password && privacyBoolean && userName && emailIsValid(email);
}

/**
 * Finalizes the account creation process by loading data, saving to local storage, and showing a success message.
 */
async function finalizeAccountCreation() {
    await loadFromFirebase();
    writeLocalStorage();
    toasterPopup('signUpSuccess', '../html/summary');
}

/**
 * Toggles the privacy policy acceptance checkbox and updates the sign-up button state.
 * @param {string} element - The ID of the privacy policy checkbox element.
 */
function acceptPrivacyPolicy(element) {
    chkboxPrivacy = document.getElementById(element);
    let myValue = chkboxPrivacy.src.search("true") > 0 ? "true" : "false";

    if (myValue == "false") {
        chkboxPrivacy.src = "../images/checkboxtrueblack.svg"
        document.getElementById("signUpBtn").disabled = false
        document.getElementById("signUpBtn").classList.remove("disabled")
    } else {
        chkboxPrivacy.src = "../images/checkboxfalseblack.svg"
        document.getElementById("signUpBtn").classList.add("disabled")
        document.getElementById("signUpBtn").disabled = true
    }
}

/**
 * Adds a red border to the specified input field to indicate an error.
 * @param {string} id - The ID of the input field to highlight.
 */
function addRedBorder(id) {
    document.getElementById(id).classList.add("redBorder");
}



