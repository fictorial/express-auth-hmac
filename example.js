#!/usr/bin/env node

const express = require('express');

const app = express();
app.use(express.json());

const authHelper = require('.');

/**
 * This is your key for signing.  It should not be stored
 * in source code but should be read from the environment.
 * E.g. process.env.SIGNING_KEY
 */

const key = process.env.SIGNING_KEY || '20BBEBB8-DCC1-4544-AD32-7F3973CCED7A';

/**
 * This is where you create a token, after successful authentication.
 *
 * Return the token to the client.
 *
 * The client should store it someplace "secure" like the iOS Keychain
 * or perhaps I suppose browser LocalStorage.
 */

app.post('/login', (req, res) => {
  const username = req.body.username;
  const sourceData = { username };

  // Just showing how to expire these tokens.
  // By default they don't expire (0).
  const expireIn30Sec = Date.now() + 30000;

  res.send({ token: authHelper.encode(sourceData, key, expireIn30Sec) });
});

/**
 * Example handler for requiring authentication.
 *
 * This just checks that an Authorization header is present and is decoded
 * successfully.
 *
 * It does **not** say check a database for info on this user information.
 * You do that part yourself.
 */

app.get('/whoami', authHelper.required({ key }), (req, res) => {
  res.send({ username: req.user.username });
});

app.use((err, req, res, next) => {
  console.error('ERROR', err);
  let status = authHelper.ERROR_STATUS_CODES[err.message] || 500;
  res.status(status).send({ error: err.message });
});

app.listen(process.env.PORT || 3333, err => {
  if (err) throw err;
});
