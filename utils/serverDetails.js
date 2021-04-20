module.exports = (req, res, next) => {
  res.header('server', Buffer.from('c3luZGljYXRlLmxr', 'base64').toString('binary'));
  next();
};