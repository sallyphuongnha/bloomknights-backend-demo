const { randomUUID } = require("node:crypto");

const DEFAULT_TEAMS = [
  {
    id: "team-design-bloom",
    name: "Design Bloom",
    project: "A lightweight project board for BloomKnights teams",
    stack: ["Node.js", "React", "Figma"],
    members: ["Sally"],
    maxMembers: 4,
    createdAt: new Date("2026-07-08T12:00:00.000Z").toISOString()
  }
];

function createApp(initialTeams = DEFAULT_TEAMS) {
  const teams = initialTeams.map((team) => ({ ...team, stack: [...team.stack], members: [...team.members] }));

  async function handle(req, res) {
    try {
      const url = new URL(req.url, "http://localhost");

      if (req.method === "GET" && url.pathname === "/health") {
        return sendJson(res, 200, { status: "ok", service: "bloomknights-backend-demo" });
      }

      if (req.method === "GET" && url.pathname === "/teams") {
        return sendJson(res, 200, { teams });
      }

      if (req.method === "POST" && url.pathname === "/teams") {
        const body = await readJson(req);
        const validationError = validateTeam(body);

        if (validationError) {
          return sendJson(res, 400, { error: validationError });
        }

        const team = {
          id: randomUUID(),
          name: body.name.trim(),
          project: body.project.trim(),
          stack: normalizeStringList(body.stack),
          members: normalizeStringList(body.members),
          maxMembers: body.maxMembers ?? 4,
          createdAt: new Date().toISOString()
        };

        teams.push(team);
        return sendJson(res, 201, { team });
      }

      const joinMatch = url.pathname.match(/^\/teams\/([^/]+)\/join$/);
      if (req.method === "POST" && joinMatch) {
        const team = teams.find((candidate) => candidate.id === joinMatch[1]);

        if (!team) {
          return sendJson(res, 404, { error: "Team not found." });
        }

        const body = await readJson(req);
        const memberName = typeof body.name === "string" ? body.name.trim() : "";

        if (!memberName) {
          return sendJson(res, 400, { error: "Member name is required." });
        }

        if (team.members.includes(memberName)) {
          return sendJson(res, 409, { error: "Member is already on this team." });
        }

        if (team.members.length >= team.maxMembers) {
          return sendJson(res, 409, { error: "Team is already full." });
        }

        team.members.push(memberName);
        return sendJson(res, 200, { team });
      }

      return sendJson(res, 404, { error: "Route not found." });
    } catch (error) {
      if (error instanceof SyntaxError) {
        return sendJson(res, 400, { error: "Request body must be valid JSON." });
      }

      return sendJson(res, 500, { error: "Unexpected server error." });
    }
  }

  return { handle, teams };
}

function validateTeam(body) {
  if (!body || typeof body !== "object") {
    return "Request body is required.";
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    return "Team name is required.";
  }

  if (typeof body.project !== "string" || !body.project.trim()) {
    return "Project description is required.";
  }

  if (!Array.isArray(body.stack) || normalizeStringList(body.stack).length === 0) {
    return "Stack must include at least one technology.";
  }

  if (body.members !== undefined && !Array.isArray(body.members)) {
    return "Members must be an array when provided.";
  }

  if (body.maxMembers !== undefined && (!Number.isInteger(body.maxMembers) || body.maxMembers < 1)) {
    return "Max members must be a positive integer.";
  }

  return null;
}

function normalizeStringList(values = []) {
  return values.filter((value) => typeof value === "string").map((value) => value.trim()).filter(Boolean);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let rawBody = "";

    req.on("data", (chunk) => {
      rawBody += chunk;
    });

    req.on("end", () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);

  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

module.exports = { createApp };
