import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { Accounts } from 'meteor/accounts-base';
import dotenv from 'dotenv';

import { createGraphQLPublication } from 'meteor/swydo:ddp-apollo';
import { makeExecutableSchema } from 'graphql-tools';
import { typeDefs, resolvers } from '../imports/api/graphql/index';


Meteor.startup(function() {
    if (Meteor.isServer) {
        const schema = makeExecutableSchema({
            typeDefs,
            resolvers,
        });

        createGraphQLPublication({
            schema,
        });
        dotenv.config({
            path: `${process.env.PWD}/.env`,
        });
        // Set ambiguous error messages on login errors
        // eslint-disable-next-line no-underscore-dangle
        Accounts._options.ambiguousErrorMessages = true;

        // Set up rate limiting on login
        Accounts.removeDefaultRateLimit();
        DDPRateLimiter.setErrorMessage((r) => {
            const { timeToReset } = r;
            const time = Math.ceil(timeToReset / 60000);
            return `Too many requests. Try again in ${time} minutes.`;
        });
        DDPRateLimiter.addRule(
            {
                userId: null,
                clientAddress: null,
                type: 'method',
                name: 'login',
                // eslint-disable-next-line no-unused-vars
                connectionId: connectionId => true,
            },
            5,
            300000,
        );
    }
});
