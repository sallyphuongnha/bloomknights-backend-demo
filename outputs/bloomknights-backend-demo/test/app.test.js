const { Readable } = require("node:stream");
const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

test("GET /health returns service status", async () => {
  const app = createApp();
  const response = await request(app, "/health");

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, "ok");
});

test("POST /teams creates a validated team", async () => {
  const app = createApp([]);

  const response = await request(app, "/teams", {
    method: "POST",
    body: {
      name: "Backend Builders",
      project: "API for matching people to mini-hackathon teams",
      stack: ["Node.js", "PostgreSQL"],
      members: ["Sally"],
      maxMembers: 3
    }
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.team.name, "Backend Builders");
  assert.deepEqual(response.body.team.stack, ["Node.js", "PostgreSQL"]);
});

test("POST /teams rejects incomplete payloads", async () => {
  const app = createApp([]);
  const response = await request(app, "/teams", {
    method: "POST",
    body: { name: "Missing Project", stack: ["Node.js"] }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Project description is required.");
});

test("POST /teams/:id/join adds a member when space is available", async () => {
  const app = createApp([
    {
      id: "team-api",
      name: "API Team",
      project: "Build useful backend routes",
      stack: ["Node.js"],
      members: ["Sally"],
      maxMembers: 2,
      createdAt: new Date().toISOString()
    }
  ]);

  const response = await request(app, "/teams/team-api/join", {
    method: "POST",
    body: { name: "Alex" }
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.team.members, ["Sally", "Alex"]);
});

async function request(app, path, options = {}) {
  const body = options.body ? JSON.stringify(options.body) : undefined;
  const req = Readable.from(body ? [body] : []);
  req.method = options.method || "GET";
  req.url = path;

  let statusCode;
  let responseBody;
  const res = {
    writeHead(code) {
      statusCode = code;
    },
    end(payload) {
      responseBody = payload;
    }
  };

  await app.handle(req, res);

  return {
    statusCode,
    body: responseBody ? JSON.parse(responseBody) : null
  };
}
