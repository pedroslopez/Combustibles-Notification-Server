const express = require('express');
const app = express();

const PORT = 3000;

const register = require('./router/registration');

app.use('/api/notifications/token', register);

app.listen(PORT, () => console.log('Notification server running on port 3000.'));