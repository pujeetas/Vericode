require("dotenv").config();
const express = require("express");
const router = express.Router();
const Anthropic = require("@anthropic-ai/sdk");
const pool = require("../db");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post("/", async (req, res) => {
  const { code, reviewType } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    //Detect language
    const langDetect = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 10,
      messages: [
        {
          role: "user",
          content: `What programming language is this? Reply with one word only.\n\n${code}`,
        },
      ],
    });

    const language = langDetect.content[0].text.trim();

    //Stream the review back
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.write(
      `data: ${JSON.stringify({ type: "language", value: language })}\n\n`,
    );

    let fullFeedback = "";

    const stream = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      stream: true,
      messages: [
        {
          role: "user",
          content: `Review this ${language} code for ${reviewType || "general quality"}.

Format your response exactly like this:
SEVERITY: critical/moderate/minor
ISSUES:
- issue 1
- issue 2
SUGGESTIONS:
- suggestion 1
- suggestion 2

Code:
${code}`,
        },
      ],
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta") {
        const chunk = event.delta.text;
        fullFeedback += chunk;
        res.write(
          `data: ${JSON.stringify({
            type: "chunk",
            value: chunk,
          })}\n\n`,
        );
      }
    }

    // Save to database
    const severity = fullFeedback.match(/SEVERITY:\s*(\w+)/i)?.[1] || "unknown";

    const result = await pool.query(
      `INSERT INTO reviews (code, language, review_type, feedback, severity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [code, language, reviewType, fullFeedback, severity],
    );

    const reviewId = result.rows[0].id;

    res.write(`data: ${JSON.stringify({ type: "done", reviewId })}\n\n`);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Review failed" });
  }
});

// GET single review by ID
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM reviews WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch review" });
  }
});

// GET all reviews
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, language, review_type, severity, created_at 
       FROM reviews 
       ORDER BY created_at DESC 
       LIMIT 50`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

module.exports = router;
