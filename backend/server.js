const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);


app.listen(port, (req, res) => {
    console.log("Server is running on port "+port);
});