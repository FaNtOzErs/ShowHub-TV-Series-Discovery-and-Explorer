module.exports = function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const time = new Date().toISOString();
    console.log(`[${time}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start} ms)`);
  });
  next();
};
