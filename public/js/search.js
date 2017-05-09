(function(){
  var message = $(".ui.transition.message.main"),
      list    = $(".ui.transition.message.main .list"),
      header  = $(".ui.transition.message.main .header"),
      list    = $('#list');


  const getYearsOld = (birthdate) => {
    var date = new Date(),
        birthdate = new Date(birthdate)
        todayYear = date.getFullYear(),
        todayMonth = date.getMonth(),
        today = date.getDate(),
        birthYear = birthdate.getFullYear(),
        birthMonth = birthdate.getMonth(),
        birthDay = birthdate.getDate(),
        age = todayYear - birthYear;

    if (todayMonth < birthMonth)
      age--;
    else if (todayMonth === birthMonth && today < birthDay)
      age--;
    return age;
  }

  const displayMsg = (headerText, type, lines, messageBox = [message, header, list]) => {
    messageBox[0].removeClass("negative positive success").addClass(type);
    messageBox[1].text(headerText);
    messageBox[2].empty();
    lines.forEach((line) => {
      if (typeof line === 'object'){
        if (typeof line[1] === 'object'){
          line[1].classList.add((type === 'negative') ? 'error' : 'success');
        } else if (typeof line[1] === 'string'){
          $("[name='" + line[1] + "']").closest(".field")[0].classList.add((type === 'negative') ? 'error' : 'success');
        }
        messageBox[2].append("<li>" + line[0] + "</li>");
      } else {
        messageBox[2].append("<li>" + line + "</li>");
      }
    });
  }

  $(document).ready(function(){
    $('.message .close')
      .on('click', function() {
        $(this)
          .closest('.message')
          .transition('fade');
      });

    request('/getUserInfo', 'POST', $({name: 'id_user', value: undefined}), (res) => {
      for (var i = 0; i < res.data.length; i++){
        list.append($(`<div class="black card">
          <div class="image">
            <img src="${res.data[i].data}">
          </div>
          <div class="content">
            <div class="header">${res.data[i].firstname} ${res.data[i].lastname}</div>
            <div class="meta">
              <a>${getYearsOld(res.data[i].birthdate)} years old</a>
            </div>
          </div>
        </div>`));
      }
    }, (res) => {
      $('html, body').animate({scrollTop: message.offset().top}, 'slow');
      message.transition({animation: 'fade', duration: 1500});
      displayMsg("Can't load pictures", 'negative', res.error);
    });
  });
})();
