const makeRes = (message = null, data = null) => {
  return { message, data };
};

const to = (promise) => {
  return promise.then(data => {
    return [null, data];
  }, (err => [err]));
};

const filterErrors = (errors) => {
  return errors.map(error => error.message);
};

module.exports = {
  makeRes,
  to,
  filterErrors,
};