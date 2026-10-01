/* exported handler */
function handler(event) {
  const request = event.request;
  if (request.uri === '/resume') {
    request.uri = '/resume/index.html';
  }
  return request;
}
