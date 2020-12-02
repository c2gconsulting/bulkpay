
import { HTTP } from 'meteor/http'

/**
 *  Attachment Upload Method
 */
Meteor.methods({
  uploadFile: function (myHeaders, formData) {
    // fileType, file
    this.unblock();
    try {
      console.log('myHeaders', myHeaders)
      const fileUploadQueryUrl = 'https://9ic0ul4760.execute-api.eu-west-1.amazonaws.com/dev/upload'
      // const url = 'https://geo.getreaction.io/json'
      // var result = Meteor.http.call("POST", fileUploadQueryUrl, { body, data: body });
      // let requestHeaders = { 'Content-Type': 'form-data' }
      // var myHeaders = new Headers();
      // myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImNvbXBhbnlOYW1lIjoiYzJnIGNvbnN1bHRpbmciLCJmaXJzdE5hbWUiOiJGaXJzdE5hbWUiLCJsYXN0TmFtZSI6Ikxhc3ROYW1lIiwiZW1haWwiOiJhZGVzYW5taWFrb2xhZGVkb3R1bkBnbWFpbC5jb20iLCJhY3RpdmF0aW9uTGluayI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDIwMC9hY3RpdmF0aW9uIiwicGhvbmVOdW1iZXIiOiIwODE2MTc2Nzc2MiJ9LCJpYXQiOjE1OTU0MjYyMzYsImV4cCI6MTU5NTQyOTgzNn0.ZOT4-PcHT0gSg8kHipmycco1Yx2VcCJRoqEbezCn1R4");
      // const header = { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImNvbXBhbnlOYW1lIjoiYzJnIGNvbnN1bHRpbmciLCJmaXJzdE5hbWUiOiJGaXJzdE5hbWUiLCJsYXN0TmFtZSI6Ikxhc3ROYW1lIiwiZW1haWwiOiJhZGVzYW5taWFrb2xhZGVkb3R1bkBnbWFpbC5jb20iLCJhY3RpdmF0aW9uTGluayI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDIwMC9hY3RpdmF0aW9uIiwicGhvbmVOdW1iZXIiOiIwODE2MTc2Nzc2MiJ9LCJpYXQiOjE1OTU0MjYyMzYsImV4cCI6MTU5NTQyOTgzNn0.ZOT4-PcHT0gSg8kHipmycco1Yx2VcCJRoqEbezCn1R4" };
      // let serverRes = HTTP.call('GET', url, {data: body, headers: requestHeaders});
      // var result = fetch("POST", fileUploadQueryUrl, { headers: header, body: formData, data: formData, redirect: 'follow' });
      // var result = HTTP.post(fileUploadQueryUrl, { body, data: body });
      // console.log('body', fileType)

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formData,
        redirect: 'follow'
      };
      const result = HTTP.call('POST', fileUploadQueryUrl, { headers: myHeaders, body: formData, data: formData, redirect: 'follow' });
      // fetch("https://9ic0ul4760.execute-api.eu-west-1.amazonaws.com/dev/upload", requestOptions)
      //   .then(response => response.text())
      //   .then(result => console.log(result))
      //   .catch(error => console.log('error', error));

      console.log('result', result);
    } catch(err) {
      console.log('err', err)
    }
  },
  insertAttachment: function (name, { buffer, businessId }) {
    this.unblock();
    const attachmentId = Attachment.insert({
      name: name,
      base64: buffer,
      businessId
    })
    return { _id: attachmentId }
  }
});
