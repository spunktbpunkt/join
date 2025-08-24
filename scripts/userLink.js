function donothing(event) {
    event.stopPropagation();
}

/**
 * shows small overlay with options to link to another page
 */
function showUserLinksOptions() {
    document.getElementById("userLinkOptions").classList.toggle("hide");
    addHelpToPopup();
    closeUserLinksOnOutsideClick();
}

/**
 * hides small overlay with options to link to another page
 */
function hideUserLinksOptions() {
    const el = document.getElementById("userLinkOptions");
    if (!el.classList.contains("hide")) {
        el.classList.add("hide");
    }
}

/**
 * adds the option to link to the "Help" page according to window dimensions
 */
function addHelpToPopup() {
  const width = window.innerWidth;
  const container = document.getElementById("userLinkOptions");
  if (!container) return;

  try {
    container.innerHTML = width <= 800
      ? `<a href="../html/help.html" class="userLinkOptionsLinks">Help</a>
         <a href="../html/legalNotice.html" class="userLinkOptionsLinks">Legal Notice</a>
         <a href="../html/privacyPolicy.html" class="userLinkOptionsLinks">Privacy Policy</a>
         <a onclick="logout()" class="userLinkOptionsLinks">Log out</a>`
      : `<a href="../html/legalNotice.html" class="userLinkOptionsLinks">Legal Notice</a>
         <a href="../html/privacyPolicy.html" class="userLinkOptionsLinks">Privacy Policy</a>
         <a onclick="logout()" class="userLinkOptionsLinks">Log out</a>`;
  } catch (e) {}
}

/**
 * closes the options overlay when clicking outside of its borders
 */
function closeUserLinksOnOutsideClick() {
    document.addEventListener("click", (event) => {
        const popup = document.getElementById("userLinkOptions");
        const userLink = document.getElementById("userLink");

        if (popup && !popup.classList.contains("hide")) {
            const isClickOutside = !popup.contains(event.target) && !userLink.contains(event.target);
            if (isClickOutside) {
                hideUserLinksOptions();
            }
        }
    });
}
