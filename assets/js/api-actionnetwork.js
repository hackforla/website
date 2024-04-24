(function (window, document, undefined) {
  //capture all DOM Elements
  var heroForm = document.querySelector(".hero-signup");
  var heroFormInput = document.getElementById("hero-signup");
  var heroBtn = document.getElementById("hero-signup-btn");

  var contactForm = document.querySelector(".contact-form");
  var contactFormEmail = document.getElementById("contact-email");
  var contactFormBtn = document.getElementById("contact-form-btn");

  var heroFormConfirm = document.querySelector(".form-confirmation strong");
  var contactFormConfirm = document.querySelector(
    ".contact-form .form-confirmation strong"
  );

  // API CONNECTION INFO
  var ACTION_NETWORK_API = "";
  var url = "https://actionnetwork.org/api/v2/people/";

  // FORM SUBMISSION HELPER FUNCTIONS
  var submitEmail = function (url = ``, email) {
    var postData = {
      person: {
        email_addresses: [{
          address: email
        }]
      }
    };

    return fetch(url, {
      method: "POST",
      headers: {
        "OSDI-API-Token": ACTION_NETWORK_API,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postData)
    }).then(response => response.json());
  };

  var setPostMessage = function (targetNode, error) {
    var successMessage = document.createTextNode(
      "Thanks! You'll hear from us soon."
    );
    var errorMessage = document.createTextNode(error);

    if (error) {
      targetNode.innerHTML = '';
      targetNode.appendChild(errorMessage);
    } else {
      targetNode.innerHTML = '';
      targetNode.appendChild(successMessage);
    }
  };

  var validateEmail = function (email) {
    var pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

    return pattern.test(email);
  }

  // EVENT LISTENERS FOR FORM SUBMISSIONS
  if (heroBtn) {
    heroBtn.addEventListener("click", function (event) {
      event.preventDefault();
      var email = heroFormInput.value;

      if (validateEmail(email)) {
        submitEmail(url, email)
          .then(function (data) {
            if (data.error) {
              setPostMessage(heroFormConfirm, data.error);
            } else {
              setPostMessage(heroFormConfirm);
            }

            heroForm.reset();
          })
          .catch(function (error) {
            var errorMessage = document.createTextNode(error.message);
            heroFormConfirm.appendChild(errorMessage);
            heroForm.reset();
          });
      } else {
        setPostMessage(heroFormConfirm, "Invalid Email Format");
      }
    });
  }

  if (contactFormBtn) {
    contactFormBtn.addEventListener("click", function (event) {
      event.preventDefault();
      var email = contactFormEmail.value;

      if (validateEmail(email)) {
        submitEmail(url, email)
          // submitEmail(url, email)
          .then(function (data) {
            if (data.error) {
              setPostMessage(contactFormConfirm, data.error);
            } else {
              setPostMessage(contactFormConfirm);
            }

            contactForm.reset();
          })
          .catch(function (error) {
            var errorMessage = document.createTextNode(error.message);
            contactFormConfirm.appendChild(errorMessage);
            contactForm.reset();
          });
      } else {
        setPostMessage(contactFormConfirm, "Invalid Email Format");
      }
    });
  }
})(window, document);
