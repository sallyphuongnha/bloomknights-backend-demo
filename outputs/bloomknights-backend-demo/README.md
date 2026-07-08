# BloomKnights Backend Demo

A small Node.js REST API that models team coordination for a mini-hackathon.

I built this as a simple backend sample to show:

- REST API routing
- JSON request/response handling
- Input validation
- Basic error handling
- Automated tests with Node's built-in test runner
- Dependency-free backend structure

## Tech Stack

- Node.js
- Built-in `http` module
- Built-in `node:test` test runner

## Run Locally

```bash
npm start
```

The API runs at:

```text
http://localhost:3000
```

## Run Tests

```bash
npm test
```

## Endpoints

### Health Check

```http
GET /health
```

Example response:

```json
{
  "status": "ok",
  "service": "bloomknights-backend-demo"
}
```

### List Teams

```http
GET /teams
```

### Create Team

```http
POST /teams
Content-Type: application/json
```

Example body:

```json
{
  "name": "Backend Builders",
  "project": "API for matching people to mini-hackathon teams",
  "stack": ["Node.js", "PostgreSQL"],
  "members": ["Sally"],
  "maxMembers": 4
}
```

### Join Team

```http
POST /teams/:id/join
Content-Type: application/json
```

Example body:

```json
{
  "name": "Alex"
}
```

## Notes

This version stores data in memory to keep the demo easy to review. In a production version, I would connect it to a database such as PostgreSQL or MongoDB, add authentication, and split the routes/controllers into separate modules as the API grows.
