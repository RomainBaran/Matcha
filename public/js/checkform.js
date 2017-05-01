var checkform = (inputs, tests, error_display) => {
  var errors = [],
      len = tests.length,
      len_subtab = 0;

  for (var i = 0; i < tests.length; i++){
    len_subtab = tests[i].length;
    for (var j = 0; j < len_subtab; j++){
      if (tests[i][j] === false){
        errors.push([error_display[i][j], inputs.closest(".field")[i]]);
        break ;
      }
    }
  }
  return errors;
}
