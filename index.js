const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const axios = require('axios')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(bodyParser.json());

// A middleware that sends an authorization in the header in every request


const db = require('./dummy_data')
const bodyParser = require('body-parser')

const secret = 'thisismysecretkey'

app.get('/viewNotes', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.status(401).json({ error: 'Invalid token' })
      } else {
        console.log(decoded.username)
        res.json({ message: 'Viewing notes' })
      }
    })
})

app.post('/login', (req, res) => {
  const { username, password } = req.body
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username }, secret, { expiresIn: '1h' })
    res.json({ token })
  } else {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

app.post('/newNote', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.status(401).json({ error: 'Invalid token' })
      } else {
        const { title, content } = req.body
        res.json({ message: `Note created with title ${title} and content ${content}` })
      }
    })
})

app.get('/protected', (req, res) => {
  const token = req.headers.authorization.split(' ')[1]
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      res.status(401).json({ error: 'Invalid token' })
    } else {
      res.json({ message: `Welcome ${decoded.username}` })
    }
  })
})

app.listen(3000, () => {
  console.log('Server started on port 3000')
})