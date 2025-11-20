const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/notes',noteRoutes);


app.listen(port, (req, res) => {
    console.log(`Server is running on port ${port}`);
});