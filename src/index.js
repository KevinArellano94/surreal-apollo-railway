const { ApolloServer, gql } = require('apollo-server');
const { default: Surreal } = require("surrealdb.js");


const typeDefs = gql`
  type User {
    id: ID!
    name: String!
  }

  type Query {
    users: [User]!
  }
`;

const resolvers = {
    Query: {
        users: async () => {
            try {
                const url = process.env.SURREAL_URL;
                const db = new Surreal(url);

                await db.connect(url, {
                    namespace: process.env.NAMESPACE,
                    database: process.env.DATABASE,

                    auth: {
                        namespace: process.env.NAMESPACE,
                        database: process.env.DATABASE,
                        // scope: 'root',
                        username: process.env.USERNAME,
                        password: process.env.PASSWORD,
                    },
                });

                let usersResult = await db.select("users");

                return usersResult.map(user => ({
                    id: user.id,
                    name: user.name
                }));
            } catch (error) {
                throw new Error('Failed to fetch users');
            }
        }
    }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});