/**
 * Generates the HTML overlay for adding or editing a contact.
 * @param {'add'|'edit'} mode - The mode of the overlay ('add' for adding a contact, 'edit' for editing a contact).
 * @param {'big'|'small'} size - The size of the overlay ('big' or 'small').
 * @returns {string} - The HTML string for the contact overlay.
 */
function contactDetailsTemp(mode, size) {
  const isAdd = mode === 'add';
  const title = isAdd ? 'Add contact' : 'Edit contact';
  const leftBtnLabel = isAdd ? 'Cancel' : 'Delete';
  const leftBtnAction = isAdd
    ? `hideContactForm('add')`
    : `contactForm('delete','edit')`;
  const rightBtn = isAdd
    ? `<button onclick="contactForm('add','add')" id="rightBtn" class="contactBtn blueBtn" disabled>
         Create contact<img src="../images/check.svg" alt="" class="marginLeft10"/>
       </button>`
    : `<button onclick="contactForm('save','edit')" id="rightBtn" class="contactBtn blueBtn">
         Save<img src="../images/check.svg" alt="" class="marginLeft10"/>
       </button>`;

  return `
    <div id="addContactFrame" class="visibleNone" onclick="event.stopPropagation()">
      <img id="closeFormImg"
        class="closeFormImg"
        src="../images/close.svg"
        alt="Close"
        onclick="hideContactForm('${mode}')"
      />

      <section id="addContactLeft">
        <div id="addContactDivMiddle">
          <img src="../images/joinlogowhite.svg" alt="Logo" />
          <h1>${title}</h1>
          <h4>Tasks are better with a team!</h4>
          <figure></figure>
        </div>
      </section>

      <div id="addContactRight">
        <div id="addContactRightDiv">

            <div id="addContactRightInitialsDiv" class="grayBackground">
              <img id="addContactRightImg" src="../images/personwhite.svg" alt="Avatar"/>
              <span id="addContactRightInitials" class="hide">ZZ</span>
            </div>
          
          <div id="addContactRightInputs">
            <div class="flexColumn gap20px">
             <div id="addContactBtnDiv" class="flexColumn">
                 <input type="text" id="nameInputContact" placeholder="Name"  class="loginInput personImgBackground"/ onblur="checkName(this.id)" onkeydown="checkEnter(event, this.id)">
                 <span id="nameErrorSpanContact" class="errorSpanContact"></span>
                 <input type="text" id="emailInputContact" placeholder="Email" class="loginInput mailImgBackground" onblur="checkName(this.id)" onkeydown="checkEnter(event, this.id)"/>
                 <span id="emailErrorSpanContact" class="errorSpanContact"></span>
                 <input type="text" minlength="10" id="phoneInputContact" placeholder="Phone" class="loginInput callImgBackground"/>
                 <span id="phoneErrorSpanContact" class="errorSpanContact"></span>
            </div>
            <div class="addContactBtnDiv widthFitContent">
              <button
                onmouseover="changeImage('leftBtnImg','cancelblue')"
                onmouseleave="changeImage('leftBtnImg','canceldarkblue')"
                onclick="${leftBtnAction}"
                id="leftBtn"
                class="contactBtn whiteBtn">
                ${leftBtnLabel}
                <img id="leftBtnImg" src="../images/canceldarkblue.svg" alt="" class="marginLeft10"/>
              </button>
              ${rightBtn}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}
