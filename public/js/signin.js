(function(){
  var inputs          = $("input"),
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

    $('#submit').on("click", function(ev){
      ev.preventDefault();
      var errorInputs = $(".error"),
          errors = checkform(inputs, [
        [inputs[0].name === "email", inputs[0].value.length > 0, /^[\w\-\.]+@([\w]+\.){1,2}[a-zA-Z]{2,3}$/.test(inputs[0].value)],
        [inputs[1].name === "password", inputs[1].value.length > 0, /^(?=(.*[a-zA-Z]){4,})(?=(.*[0-9]){2,})\w+$/.test(inputs[1].value)],
      ], [
        ["Wrong email input name sent", "Email input needs to be filled", "Email format isn't correct"],
        ["Wrong password input name sent", "Password input needs to be filled", "Password can contain only letters and numbers, at least 4 letters and 2 numbers"],
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
        request('/login', 'POST', inputs, (res) => {
          window.location.replace('/');
        }, (res) => {
          $('html, body').animate({scrollTop: message.offset().top}, 'slow');
          message.transition({animation: 'fade', duration: 1500});
          displayMsg("Error from server", 'negative', res.error);
        });
      }
    });
  });
})();
