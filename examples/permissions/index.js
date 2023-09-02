const { GraphQLServer } = require('graphql-yoga')

// Schema

const code = 'supersecret'

const typeDefs = `
  type Query {
    open: String!
    secured: String!
    me: Me!
  }

  type Me {
    name: String!
    surname: String!
    age: Int!
  }
`

const resolvers = {
  Query: {
    open: () => `Open data, everyone's welcome!`,
    secured: () => `Personal diary - this is for my eyes only!`,
    me: () => ({}),
  },
  Me: {
    name: () => 'Ben',
    surname: () => 'Cool',
    age: () => 18,
  },
}

// Middleware - Permissions

const isLoggedIn = async (resolve, parent, args, ctx, info) => {
  // Include your agent code as Authorization: <token> header.
  const permit = ctx.request.get('Authorization') === code

  if (!permit) {
    throw new Error(`Not authorized!`)
  }

  return resolve()
}

const permissions = {
  Query: {
    secured: isLoggedIn,
  },
  Me: isLoggedIn,
}

// Server

const server = new GraphQLServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  middlewares: [permissions],
  context: req => ({ ...req }),
})

server.start(() => console.log('Server is running on http://localhost:4000'))
