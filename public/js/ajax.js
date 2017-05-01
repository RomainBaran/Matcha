var jsonCreate = (data) => {
  var jsonData = [],
      obj = {};
  data.each((index, elem) => {
    obj[elem.name] = elem.value;
  });
  jsonData.push(obj);
  return JSON.stringify(jsonData);
}

function request(url, method, data, success = null, error = null){
  data = jsonCreate(data);
  $.ajax(url,{
    method: method,
    data: data,
    contentType: 'application/json',
    dataType: 'json',
    accepts:{
      json: 'application/json'
    },
    converters:{
      'text json': JSON.parseJSON
    },
    timeout: 30000
  })
  .fail((res, status) => {
    if (typeof error === 'function'){
      if ('error' in res){
        error(res);
      } else {
        error({error: ["Timeout"]});
      }
    }
    return ;
  })
  .done((res) => {
    if ('error' in res){
      if (typeof error === 'function')
        error(res)
      return ;
    }
    if (typeof success === 'function')
      success(res);
  });
}
