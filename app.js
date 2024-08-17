const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')
const PORT = process.env.PORT ?? 1234

const app = express()
app.use(express.json())
app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.send('<h1>Mi primer API REST</h1>')
})

// Metodos normales: GET/HEAD/POST
// Metodos complejos: PUT/DELETE/PATCH

// CORS PRE-FLIGHT
// OPTIONS /movies
const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:1234'
]

app.get('/movies', (req, res) => {
  const origin = req.header('origin') // Se verifica que el origin este dentro de los permitidos
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin) // <-- En caso que si este o no existe
    // se le otorgara el acceso
  }
  const { genre } = req.query
  if (genre) {
    const movie = movies.filter(movie => movie.genre.includes(genre))
    if (movie.length !== 0) return res.json(movie)
    res.status(404).json({ message: 'Genre not found' })
  }
  res.json(movies)
})

// Obtener pelicula por ID
app.get('/movies/:id', (req, res) => { // :id path-to-regexp
  const { id } = req.params // Recuperamos el id de la url
  const movie = movies.find(movie => movie.id === id) // Verificamos que exista una pelicula con el id
  if (movie) return res.json(movie) // Se retorna el json de la pelicula si es encontrada
  res.status(404).json({ message: 'Movie not found' }) // Si no se encuentra retornamos un mensaje como objeto
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json({ message: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data // Pasa todos los datos que han sido validados en result
  }

  // No es un REST porque se almacena el estado de la aplicacion en la memoria
  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

// Habilita los metodos para ser utilizadas y diseñados
app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  // !origin es para que no se aplique el CORS en el caso de que no haya origin
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'PUT, DELETE, PATCH, GET, POST')
  }

  res.send(200)
})

// Actualizar pelicula por ID
app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params

  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ mesagge: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

app.listen(PORT, () => {
  console.log(`Server hosting on http://localhost:${PORT}`)
})
