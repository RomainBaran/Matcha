(function(){
  var progressBar     = $(".ui.indicating.progress"),
      progressBarShow = false,
      inputs          = $("input"),
      message         = $(".ui.message"),
      list            = $(".ui.message .list"),
      header          = $(".ui.message .header");

  var displayMsg = (headerText, type, lines) => {
    message.removeClass("negative positive").addClass(type);
    header.text(headerText);
    list.empty();
    lines.forEach((line) => {
      if (typeof line === 'object'){
        if (typeof line[1] === 'object'){
          line[1].classList.add((type === 'negative') ? 'error' : 'success');
        } else if (typeof line[1] === 'string'){
          $("[name='" + line[1] + "']").closest(".field")[0].classList.add((type === 'negative') ? 'error' : 'success');
        }
        list.append("<li>" + line[0] + "</li>");
      }
      else
        list.append("<li>" + line + "</li>");
    });
  }

  $(document).ready(function(){
    $('.message .close')
      .on('click', function() {
        $(this)
          .closest('.message')
          .transition('fade');
      });

    $('.dropdown').dropdown();

    $('#submit').on("click", function(ev){
      ev.preventDefault();
      var errorInputs = $(".error"),
          errors = checkform(inputs, [
        [inputs[0].name === "firstname", inputs[0].value.length > 0, /^([a-zA-Z|\ ])+$/.test(inputs[0].value)],
        [inputs[1].name === "lastname", inputs[1].value.length > 0, /^([a-zA-Z]|\ )+$/.test(inputs[1].value)],
        [inputs[2].name === "email", inputs[2].value.length > 0, /^[\w\-\.]+@([\w]+\.){1,2}[a-zA-Z]{2,3}$/.test(inputs[2].value)],
        [inputs[3].name === "password", inputs[3].value.length > 0, /^(?=(.*[a-zA-Z]){4,})(?=(.*[0-9]){2,})\w+$/.test(inputs[3].value)],
        [inputs[4].name === "date", inputs[4].value.length > 0, /^[0-9]{4}\-(0[1-9]|1[0-2])\-([0-2][0-9]|3[0-1])$/.test(inputs[4].value)],
        [inputs[5].name === "gender", (inputs[5].value === 'man' || inputs[5].value === 'girl')],
      ], [
        ["Wrong first-name input name sent", "First name input needs to be filled", "Only letters are accepted in first name input"],
        ["Wrong last-name input name sent", "Last name input needs to be filled", "Only letters are accepted in last name input"],
        ["Wrong email input name sent", "Email input needs to be filled", "Email format isn't correct"],
        ["Wrong password input name sent", "Password input needs to be filled", "Password can contain only letters and numbers, at least 4 letters and 2 numbers"],
        ["Wrong date input name sent", "Date input needs to be filled", "Wrong date format"],
        ["Wrong gender input name sent", "Wrong gender selected"],
      ]);

      if (message.hasClass('visible') || message.hasClass('in'))
        message.transition('clear queue').transition({animation: 'fade', duration: 0});

      if (errorInputs.length > 0){
        errorInputs.removeClass('error');
      }

      if (errors.length > 0){
        $('html, body').animate({scrollTop: message.offset().top}, 'slow');
        message.transition({animation: 'fade', duration: 1500});
        displayMsg("Inputs errors", 'negative', errors);
      }else{
        request('/register', 'POST', inputs, (res) => {
          $('html, body').animate({scrollTop: message.offset().top}, 'slow');
          message.transition({animation: 'fade', duration: 1500});
          displayMsg("Congratulations", 'positive', res.success);
        }, (res) => {
          $('html, body').animate({scrollTop: message.offset().top}, 'slow');
          message.transition({animation: 'fade', duration: 1500});
          displayMsg("Error from server", 'negative', res.error);
        });
      }
    });

    $("#password").on("input", function() {
       var pass = scorePassword($(this).val());
       pass = (pass > 100) ? 100 : pass;
       if ((pass > 0 && progressBarShow === false)
          || (pass <= 0 && progressBarShow === true)){
            progressBar.transition('scale');
            progressBarShow = !progressBarShow;
      }
      progressBar.progress({percent: pass});
   });
  });
})();
