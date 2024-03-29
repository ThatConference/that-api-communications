# THAT communications Api

All things communications and querying data for them.

[![Push Main CI for Cloud Run](https://github.com/ThatConference/that-api-communications/actions/workflows/pushMainCi_GRun.yml/badge.svg)](https://github.com/ThatConference/that-api-communications/actions/workflows/pushMainCi_GRun.yml)

[![.github/workflows/ci_onPushMain.yml](https://github.com/ThatConference/that-api-communications/actions/workflows/ci_onPushMain.yml/badge.svg)](https://github.com/ThatConference/that-api-communications/actions/workflows/ci_onPushMain.yml)

## Dependencies

- Node `14+`

## Setup and Configuration

- Install node.js in use: `nodenv install $(cat .node_version)`
- Load dependencies: `npm i`

setup notes:

- we use nodenv to manage node.js - [https://github.com/nodenv/nodenv](https://github.com/nodenv/nodenv)

## .env

You will need to add a `.env` file to your source. See the .env.sample included in the source base for the keys.

## Running

The main development starting point is `npm run start:watch`

- `npm run start:watch` to run with a watcher.
- `npm run start` to just run`.

## Endpoints

- Endpoint: [http://localhost:8006/](http://localhost:8006/) or [http://localhost:8006/graphql](http://localhost:8006/graphql)
