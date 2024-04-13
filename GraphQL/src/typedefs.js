const typeDefs = `
  type User {
    username: String!
    favouriteGenre: String!
    passwordHash: String!
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!
    author: Author!
    published: Int!
    id: ID!
    genres: [String]!
  }

  type Author {
    name: String!
    id: ID
    born: Int
    bookCount: Int
  }

  type Query {
    me: User
    allBooks(author: String, genre:String): [Book]
    allAuthors: [Author]
    bookCount : Int!
    authorCount: Int!
  }
  
  type Mutation {
    createUser(username: String!, favouriteGenre: String!, password: String! ): User
    login(username: String!, password: String! ): Token
    addBook(title: String!, author: String!, published: Int!, genres:[String]!): Book
    editAuthor(name: String, setBornYear: Int) : Author
  }

  type Subscription {
    bookAdded : Book!
  }
`

module.exports = typeDefs