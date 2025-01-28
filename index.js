const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const axios = require('axios')

const app = express()

const secret = 'thisismysecretkey'
const server_URL = 'http://localhost:3001'

// Middlewares 

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

// Middleware to authenticate tokens
const tokenAuthenticate = (req, res, next) => {
    const token = req.headers['authorization']
    if (!token) return res.sendStatus(401)

    jwt.verify(token, secret, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Login or Register first!"})
      req.user = decoded
      next()
    })
}


// Routes

// Register Route
app.post('/register', async(req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = { username, password: hashedPassword }

    await axios.post(`${server_URL}/users`, user)
    
    res.send(user)
})

// Login Route which gives a token after successful login
app.post('/login', async (req, res) => {
  const { username, password } = req.body
  if(!username || !password) {
    return res.status(400).json({ message: 'Username and passwrod are required'})
  }

  try {
    const response = await axios.get(`${server_URL}/users?username=${username}`)

    const user = await response.data[0]
    if (!user) return res.status(404).send('User not found!')

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) return res.status(400).json({ message : "Invalid Password" })

    const token = jwt.sign({username: user.username}, secret, { expiresIn: '1h' })
    return res.json({token})
  } catch (error) {
    return res.json("Error Logging In!")
  }
})

// An Example for a Protected Route which requires a token to access
app.get('/protected', tokenAuthenticate, async (req, res) => {
    res.json({ message: "This is a Protected Route", user: req.user})

})

app.get('/notes', tokenAuthenticate, async (req, res) => {
    try {
        const response = await axios.get(`${server_URL}/notes/username=${req.user.username}`)

        res.json({ notes: response.data})
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching notes'})
    }
})

app.post('/notes', tokenAuthenticate, async (req, res) => {
    const { note } = req.body;
    if (!note) return res.status(400).json({ message: 'Body are required!'})

    try {
        const response = await axios.post(`${server_URL}/notes`, { note, username: req.user.username })
        res.status(201).json({ message: 'Note created', note: response.data })
    } catch (error) {
        res.status(500).json({ message: 'Error creating note' })
    }
})

app.get('/notes/:id', tokenAuthenticate, async (req, res) => {
    const { id } = req.params;
  
    try {
      const response = await axios.get(`${server_URL}/notes/${id}`);
      const note = response.data;
  
      if (note.username !== req.user.username) {
        return res.status(403).json({ message: 'You do not have permission to access this note' });
      }
  
      res.json({ note });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching note' });
    }
});

app.delete('/notes/:id', tokenAuthenticate, async (req, res) => {
    const { id } = req.params;
  
    try {
      const response = await axios.get(`${server_URL}/notes/${id}`);
      const note = response.data;
  
      if (note.username !== req.user.username) {
        return res.status(403).json({ message: 'You do not have permission to delete this note' });
      }
  
      await axios.delete(`${server_URL}/notes/${id}`);
      res.json({ message: 'Note deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting note' });
    }
  });

app.listen(3000, () => {
  console.log('Server started on port 3000')
})