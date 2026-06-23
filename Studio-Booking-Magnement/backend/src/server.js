const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang vận hành mượt mà tại port ${PORT} (Express 5 Native Async Support)`);
});
