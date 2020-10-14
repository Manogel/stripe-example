import app from './app';
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`🚀 Server runing on port ${port}`);
});
