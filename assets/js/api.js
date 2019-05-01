(function (window, document, undefined) {
  //capture all DOM Elements
  var heroForm = document.querySelector(".hero-signup");
  var heroFormInput = document.getElementById("hero-signup");
  var heroBtn = document.getElementById("hero-signup-btn");

  var contactForm = document.querySelector(".contact-form");
  var contactFormEmail = document.getElementById("contact-email");
  var contactMessage = document.querySelector(".contact-form textarea");
  var contactFormBtn = document.getElementById("contact-form-btn");

  var heroFormConfirm = document.querySelector(".form-confirmation strong");
  var contactFormConfirm = document.querySelector(
    ".contact-form .form-confirmation strong"
  );

  // API CONNECTION INFO
  var ACTION_NETWORK_API = "6ff91ed1255d1966758bf3449043077a";
  var url = "https://actionnetwork.org/api/v2/people/";

  // FORM SUBMISSION HELPER FUNCTIONS
  var submitEmail = function (url = ``, email) {
    var postData = {
      person: {
        email_addresses: [{ address: email }]
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
      targetNode.appendChild(errorMessage);
    } else {
      targetNode.appendChild(successMessage);
    }
  };

  // EVENT LISTENERS FOR FORM SUBMISSIONS

  heroBtn.addEventListener("click", function (event) {
    event.preventDefault();
    var email = heroFormInput.value;

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
  });

  contactFormBtn.addEventListener("click", function (event) {
    event.preventDefault();
    var email = contactFormEmail;

    submitEmail(url, email)
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
  });
})(window, document);
