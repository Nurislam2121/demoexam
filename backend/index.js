const app = require('./src/app');

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server started at: http://127.0.0.1:${PORT}`) // можно сменить на localhost если выдает ошибку
});