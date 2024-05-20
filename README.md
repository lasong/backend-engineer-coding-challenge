# Backend Engineer coding challenge with Nestjs, Mongodb and Rabbitmq

## Prerequisites

To run the app, you must have the following installed:
- MongoDB [See installation instructions](https://www.mongodb.com/docs/manual/installation/)
- Nodejs (`v18` and above)

## Installation

- Clone the repo:

  ```bash
  $ git clone git@github.com:lasong/backend-engineer-coding-challenge.git
  ```

- Install packages:

  ```bash
  $ yarn install
  ```

### Set env variables
Create a `.env` file in the root of the repository and add the following env variables:

- MONGO_URI
- MONGO_URI_DEV (For e2e testing)
- RABBITMQ_URI (Usually `amqp://localhost`)
- REQRES_URL (Must be `https://reqres.in`)
- EMAIL_SMTP_HOST
- EMAIL_SMTP_PORT
- EMAIL_SMTP_USER
- EMAIL_SMTP_PASS
- FROM_EMAIL

For email configuration, I used https://app.elasticemail.com to get the SMTP keys. Sign up and connect to the SMTP API. You'll then be given keys for your private use.

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev
```

## Linting

```bash
$ yarn run lint
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test lint
$ yarn run test:cov
```
