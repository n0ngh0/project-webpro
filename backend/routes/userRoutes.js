const express = require('express');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('./connection');

const JWT_SECRET = 'jwtthesecret'; 

const router = express.Router();


router.post('/login', async (req, res) => {
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
router.post('/', async (req, res) => {
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
        const token = jwt.sign(
            { id: result.insertId,user: result.username },JWT_SECRET,{ expiresIn: '1h' }
        );
        res.status(200).json({message:'Registered Successfully',token: token, userId: result.insertId});
    }catch(err) {
        console.error('Error during registration:', err.message);

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Username or Email already exists.' });
        }

        return res.status(500).json({message: "Something went wrong", detail: err.message}); 
    }

});


router.get('/', async (req, res)=> {
    try{
        const [rows, fields] = await pool.query("SELECT * FROM users ");
        res.json(rows);
    }catch(err){
        res.status(500).json({message: 'Something went wrong' + err.message });
    }
});

router.put('/:id', async (req,res) => {
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

router.delete('/:id', async (req, res)=>{
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

router.get('/profile/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const [rows, fields] = await pool.query("SELECT file_img FROM users WHERE user_id = ?",id);

        res.json(rows);
    }catch(err) {
        res.status(500).json({message: "Something went wrong"});
    }
    
});

module.exports = router;