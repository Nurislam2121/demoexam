const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path')
const multer = require('multer');

const db = require('./config/db');
const app = express();

app.use(cors()); 
app.use(express.json());

app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.post('/api/register', async (req,res) => {
    const {username, full_name, password} = req.body
    if(!username || !full_name || !password) {
        return res.status(401).json({error: "Заполните все поля"})
    }

    const password_hash = crypto.createHash('sha256').update(password).digest('hex')

    try {
        await db.query('insert into users(username, full_name, password_hash) values($1,$2,$3)', [username, full_name, password_hash])
        res.status(200).json({message: "Вы успешно зарегистрировались"})
    } catch (err) {
        res.status(400).json({error: "Что что пошло не так"})
    }
})

app.post('/api/login', async (req,res) => {
    const {username, password} = req.body
    if(!username || !password) {
        return res.status(401).json({error: "Заполните все поля"})
    }

    const password_hash = crypto.createHash('sha256').update(password).digest('hex')

    try {
        const userRes = await db.query('select * from users where username = $1 and password_hash = $2', [username, password_hash])
        if(userRes.rows.length === 0) {
            return res.status(404).json({error: "Пользователь не найден"})
        }

        const userID = userRes.rows[0].user_id
        const signature = crypto.createHmac('sha256', 'secret_123').update(userID.toString()).digest('hex')

        const token = `${userID}.${signature}`
        res.status(200).json({token})
    } catch (err) {
        res.status(500).send(err.message)
    }
})

function getUserIdFromToken(req) {
    const token = req.headers['authorization']?.split(" ")[1]
    if(!token) return null

    const [userID, signature] = token.split(".")
    const expected = crypto.createHmac('sha256', 'secret_123').update(userID.toString()).digest('hex')

    return expected === signature ? parseInt(userID) : null
}

app.post('/api/tickets', async (req,res) => {
    const userID = getUserIdFromToken(req)
    if(!userID) {
        return res.status(401).json({error: "Не авторизован"})
    }

    const {movie_id, show_date, quantity} = req.body
    if(!movie_id || !show_date || !quantity) {
        return res.status(401).json({error: "ЗАполните все поля"})
    }

    if(parseInt(quantity) < 1) {
        return res.status(401).json({error: "Количество билетов должен быть больше 1"})
    }

    const selDate = new Date(show_date)
    const today = new Date()
    today.setHours(0,0,0,0)

    if(selDate < today) {
        return res.status(401).json({error: "Дата не может быть в прошлом"})
    }

    try {
        const movieRes = await db.query('select ticket_price from movies where movie_id = $1', [movie_id])
        if(movieRes.rows.length === 0) {
            return res.status(404).json({error: "Фильм не найден"})
        }

        const ticket_price = movieRes.rows[0].ticket_price
        const totalPtice = ticket_price * parseInt(quantity)

        await db.query('insert into tickets(user_id, movie_id, show_date, quantity, total_price) values($1,$2,$3,$4,$5)', [userID, movie_id, show_date, quantity, totalPtice])
        res.status(200).json({message: "Билет куплен"})
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.get('/api/profile', async (req,res) => {
    const userID = getUserIdFromToken(req)
    if(!userID) {
        return res.status(401).json({error: "Не авторизован"})
    }

    try {
        const userRes = await db.query('select username, full_name, avatar_path from users where user_id = $1', [userID])
        const ticketRes = await db.query('select t.*, m.title, m.genre, m.age_rating, m.poster_path from tickets t join movies m on t.movie_id = m.movie_id where t.user_id = $1 order by t.ticket_id desc', [userID])
        res.status(200).json({user: userRes.rows[0], tickets: ticketRes.rows})
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.post('/api/tickets/:ticket_id/refund', async (req,res) => {
    const userID = getUserIdFromToken(req)
    if(!userID) {
        return res.status(401).json({error: "Не авторизован"})
    }

    const ticketID = req.params.ticket_id

    try {
        const ticketCheck = await db.query('select * from tickets where user_id = $1 and ticket_id = $2', [userID, ticketID])
        if(ticketCheck.rows.length === 0) {
            return res.status(404).json({error: "Билет не найден"})
        }

        await db.query("update tickets set status = 'refunded' where ticket_id = $1", [ticketID])
        res.status(200).json({message: "Статус билета изменен"})
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.post('/api/profile/avatar', upload.single('avatar'), async (req,res) => {
    const userID = getUserIdFromToken(req)
    if(!userID) {
        return res.status(401).json({error: "Не авторизован"})
    }

    if(!req.file) {
        return res.status(404).json({error: "Файл не выбран"})
    }

    const avatarPath = `uploads/${req.file.filename}`

    try {
        await db.query('update users set avatar_path = $1 where user_id = $2', [avatarPath, userID])
        res.status(200).json({message:"Аватар изменен", avatar_path: avatarPath})
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.get('/api/movies', async (req,res) => {
    try {
        const {sort, genre, rating} = req.query
        let queryText = 'select * from movies '
        let value = []
        let conditions = []

        if(genre) {
            value.push(genre)
            conditions.push(` genre = $${value.length}`)
        }

        if(rating) {
            value.push(rating)
            conditions.push(` age_rating = $${value.length}`)
        }

        if(conditions.length > 0) {
            queryText += ' where ' + conditions.join(" and ") 
        }

        if(sort === 'asc') {
            queryText += ' order by ticket_price asc'
        } else if (sort === 'desc') {
            queryText += ' order by ticket_price desc'
        }
        const result = await db.query(queryText, value)
        res.json(result.rows)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

module.exports = app;
