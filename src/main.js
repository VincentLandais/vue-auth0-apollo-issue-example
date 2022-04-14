import { createApp, provide, h } from 'vue'
import App from './App.vue'

import { ApolloClient, createHttpLink, InMemoryCache, ApolloLink, concat } from '@apollo/client/core'
import { DefaultApolloClient } from '@vue/apollo-composable'

import { createAuth0, useAuth0 } from '@auth0/auth0-vue';
import { exposeAuth0, client } from './plugin';

const authMiddleware = new ApolloLink(async (operation, forward) => {
    console.log(client.value.isAuthenticated)

    // THIS FUNCTION IS EXECUTED BEFORE EACH APOLLO REQUEST, THIS IS WHERE YOU CAN ADD THE AUTH0 ACCESS TOKEN
    // const { getAccessTokenSilently, isAuthenticated } = client.value.useAuth0(); // RETURNS UNDEFINED WHEN EXECUTING MUTATIONS

    /* IN A REAL SITUTATION ADD BEARER TOKEN TO REQUEST HEADERS...
    if (isAuthenticated.value) {
        const token = await getAccessTokenSilently()
        operation.setContext({
            headers: {
                ...(token ? { authorization: `Bearer ${token}` } : {}),
            }
        });
    }*/
    return forward(operation);
})

const httpLink = createHttpLink({
    uri: "https://graphqlzero.almansi.me/api",
})

const apolloClient = new ApolloClient({
    link: concat(authMiddleware, httpLink),
    cache: new InMemoryCache(),
})

createApp({
    setup() {
        provide(DefaultApolloClient, apolloClient)
    },

    render: () => h(App),
}).use(createAuth0())
    .use(exposeAuth0())
    .mount('#app')