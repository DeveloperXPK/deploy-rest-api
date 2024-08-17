const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    required_error: 'Title is required',
    invalid_type_error: 'Title must be a string'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    required_error: 'Poster must be a URL'
  }),
  genre: z.array(z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Sci-fi']), {
    required_error: 'Genre is required',
    invalid_type_error: 'Genre must be an array of strings',
    invalid_enum_error: 'Genre must be one of the following: Action, Adventure, Comedy, Drama, Fantasy, Horror, Mystery, Thriller, Sci-fi'
  })
})

function validateMovie (input) {
  return movieSchema.safeParse(input)
}

function validatePartialMovie (input) {
  return movieSchema.partial().safeParse(input)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
