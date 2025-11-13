const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;
const JWT_SECRET = 'jwtthesecret'; 

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'webpro',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [result] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);

        if(result.length === 0) {
            return res.status(401).json({error: "Invalid username or password"});
        }

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(401).json({error: "Invalid username or password"});
        }

        const token = jwt.sign(
            { id: user.user_id,user: user.username },JWT_SECRET,{ expiresIn: '1h' }
        );
        res.status(200).json({message: 'Login Successfully',token: token, userId: user.user_id});

    }catch(err){
        res.status(500).json({ error: 'Login failed'+err.message });
    }
});
app.post('/api/users', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const password_hash = await bcrypt.hash(password, 10);
        const newUser = {
            username,
            password: password_hash,
            email,
            role: 'user',
            faculty: null,
            major: null
        };

        const [result] = await pool.query("INSERT INTO users SET ?",newUser);
        res.status(200).json({message:'Registered Successfully'});
    }catch(err) {
        console.error('Error during registration:', err.message);

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Username or Email already exists.' });
        }

        return res.status(500).json({message: "Something went wrong", detail: err.message}); 
    }

});


app.get('/api/users', async (req, res)=> {
    try{
        const [rows, fields] = await pool.query("SELECT * FROM users ");
        res.json(rows);
    }catch(err){
        res.status(500).json({message: 'Something went wrong' + err.message });
    }
});

app.put('/api/users/:id', async (req,res) => {
    const id = req.params.id;
    const newInfo = req.body;

    try{
        const [results] = await pool.query("UPDATE users SET ? WHERE user_id = ?", [newInfo,id]);
        if(results.affectedRows === 0) {
            return res.status(404).json({message: "User Id " + id + " is Not Found"});
        }
        res.status(200).json({message: "Updated Successfully"}); 

    }catch(err) {
        console.error(err.message);
        res.status(500).json({message: "Something went wrong"});
    }
});

app.delete('/api/users/:id', async (req, res)=>{
    const user_id = req.params.id;
    try{
        const [result] = await pool.query("DELETE FROM users WHERE user_id = ?", [user_id]);
        if(result.affectedRows === 0 ) {
            return res.status(404).json({message: "user_id" + user_id + "is Not Found"});
        }
        res.status(200).json({message:"Delete Successfully"});
    }catch(err){    
        res.status(500).json({message: err.message});
    }
});

app.listen(port, (req, res) => {
    console.log("Server is running on port "+port);
});