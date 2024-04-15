// More refractoring not easily possible... All queries and mutations reliant on a synced set of arrays for authors and books

const mongoose = require('mongoose')
const mongoUrl = `mongodb+srv://saiadi4002:${process.env.MONGO_URI}@library.i84fg9g.mongodb.net/`
const Author = require('./Models/Author')
const Book = require('./Models/Book')
const bcrypt = require('bcrypt')
const User = require('./Models/User')
const jwt = require('jsonwebtoken')
const { GraphQLError } = require('graphql')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()



mongoose.connect(mongoUrl)
.then(() => console.log('MongoDB connection established'))
.catch( (err) => console.log('failed to connect to MongoDB', err))

const resolvers = {
    Query:  {
      bookCount: async () => {
          const books = await Book.find({})
          return books.length
      },
      authorCount: async () => {
        const authors = await Author.find({})
        return authors.length
      },
      allBooks: async (root, args) => {
        let books = Book.find({}).populate('author')
        args.author ? books = books.filter(book => book.author.name === args.author) : null
        args.genre ? books = books.filter(book => book.genres.includes(args.genre)) : null
        return books
      },
      allAuthors: async () => {
        return await Author.find({})
      },
      me: (root, args, context) => {
        return context.currentUser
      }
    },
    Mutation: {
      addBook: async (root, args, context) => {
        if (!context.currentUser) {
          throw new GraphQLError("No Active User, Adding books requires a logged in user", {
            extensions:{
              code: 'BAD_USER_INPUT'
            }
          })
        }
        let newAuthor;
        if (! await Author.findOne({name: args.author})) {
          try {
            newAuthor = new Author({
              name: args.author,
              born: null,
              bookCount: 1
            })
            await newAuthor.save()
          } catch {
            throw new GraphQLError('Author name too short', {
              extensions: {
                code:'BAD_USER_INPUT',
                invalidArgs: args.author
              }
            })
          }
  
        } else {
          newAuthor = await Author.findOne({name: args.author})
          newAuthor.bookCount++
          await Author.findByIdAndUpdate(newAuthor._id, newAuthor)
        }
        const newBook = new Book({
          ...args,
          author: newAuthor
        })
        try {
          await newBook.save()
        } catch {
          throw new GraphQLError('Book name too short', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.title
            }
          })
        }

        pubsub.publish('BOOK_ADDED',{ bookAdded: newBook })  

        return newBook
      },
      editAuthor: async (root, args, context) => {
        if (!context.currentUser) {
          throw new GraphQLError("No Active User, Modifying an author requires a logged in user", {
            extensions:{
              code: 'FORBIDDEN'
            }
          })
        }
        try {
          let author = Author.findOne({name: args.name})
          console.log(author)
          if (author) {
            author.born = args.setBornYear
            await Author.findByIdAndUpdate(author._id, author)
          }
        } catch {
          throw GraphQLError('Author name too short', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author
            }
          })
        }
        return author
      },
      login: async (root, args) => {
          const usr = await User.findOne({username: args.username})
          if (!usr) {
            throw new GraphQLError('Incorrect Username', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.username
              }
            })
          }
          const pwdMatch = await bcrypt.compare(args.password, usr.passwordHash)
          if (pwdMatch) {
            const Token = jwt.sign(usr.toJSON(), process.env.JWT_SECRET)
            return {
              value: Token
            }
          } else {
            throw new GraphQLError('Incorrect Password', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.password
              }
            })
          }
      },
      createUser: async (root, args) => {
        const newUsr = new User({
          username: args.username,
          favouriteGenre: args.favouriteGenre,
          passwordHash: await bcrypt.hash(args.password, 10)
        })
        await newUsr.save()
        return newUsr
      }
    },
    Subscription: {
      bookAdded: {
        subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
      }
    }
}

module.exports = resolvers