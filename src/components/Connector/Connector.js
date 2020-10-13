'use strict';

export default class Connector {

  static buildRequest(url, data, needCredentials, credentials, contentType){
    let r;
    if(contentType == 'multipart/form'){
      r = new Request(url, {
        method: 'POST',
        body: data,
        headers: new Headers(),
        redirect: 'follow'
      });
    }else{
      r = new Request(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: new Headers({
          'Content-type'    : 'application/json',
        }),
        redirect: 'follow'
      });
    }
    if(needCredentials){
      r.headers.append('Auth-Token',credentials['Auth-Token']);
    }
    return r;
  }

  static start(type, url, data, needCredentials, credentials, contentType, success, fail){
    let request = (type == 'post') ? Connector.buildRequest(url, data, needCredentials, credentials, contentType) : url;
    fetch(request)
    .then((res) => {
        success(res);
    })
    .catch((error) => {
        fail(error);
    });
  }
}

