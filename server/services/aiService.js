const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.AI_MODEL || 'claude-sonnet-4-6';

// Stable system prompt — cache_control lets the API reuse it across calls
// (caching kicks in once the prefix is large enough; harmless otherwise).
const SYSTEM =
  'You are HireFlow, an expert career assistant for job seekers. ' +
  'You write clear, professional, ATS-friendly content and give honest, ' +
  'specific, actionable feedback. Never invent experience the user does not have. ' +
  'When asked for JSON, return only valid JSON matching the requested shape.';

const systemBlock = [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }];

const extractText = (msg) => {
  const block = msg.content.find((b) => b.type === 'text');
  return block ? block.text : '';
};

// Free-text generation
async function textCall(prompt, maxTokens = 1500) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemBlock,
    messages: [{ role: 'user', content: prompt }],
  });
  return extractText(msg);
}

// Structured JSON generation — guaranteed to match the schema
async function jsonCall(prompt, schema, maxTokens = 1500) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemBlock,
    messages: [{ role: 'user', content: prompt }],
    output_config: { format: { type: 'json_schema', schema } },
  });
  return JSON.parse(extractText(msg));
}

// === Feature functions ===

// 1. Generate a CV from a free-text self-description
function generateCv(description) {
  return textCall(
    `Write a clean, professional CV based on this self-description. ` +
      `Format it as plain Markdown with clear section headings ` +
      `(Summary, Skills, Experience, Education). ` +
      `Do NOT return JSON and do NOT wrap the output in code fences. ` +
      `Only use information provided; do not invent details.\n\n${description}`,
    2000
  );
}

// 2. Suggest career paths that fit the user's profile
function careerPaths(profileText) {
  const schema = {
    type: 'object',
    properties: {
      roles: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            reasoning: { type: 'string' },
            matchLevel: { type: 'string', enum: ['strong', 'medium', 'stretch'] },
          },
          required: ['title', 'reasoning', 'matchLevel'],
          additionalProperties: false,
        },
      },
      upskill: { type: 'array', items: { type: 'string' } },
    },
    required: ['roles', 'upskill'],
    additionalProperties: false,
  };
  return jsonCall(
    `Based on this profile, suggest 3-5 fitting job titles (with reasoning and a ` +
      `match level) and a short list of skills to upskill in.\n\n${profileText}`,
    schema
  );
}

// 3. Analyze fit between the user's CV and a specific job description
function fitAnalysis(cvText, jobDescription) {
  const schema = {
    type: 'object',
    properties: {
      score: { type: 'integer' }, // 0-100
      summary: { type: 'string' },
      strengths: { type: 'array', items: { type: 'string' } },
      gaps: { type: 'array', items: { type: 'string' } },
    },
    required: ['score', 'summary', 'strengths', 'gaps'],
    additionalProperties: false,
  };
  return jsonCall(
    `Compare this CV against this job description. Give a match score from 0 to 100, ` +
      `a one-paragraph summary, key strengths, and gaps to address.\n\n` +
      `=== CV ===\n${cvText}\n\n=== JOB DESCRIPTION ===\n${jobDescription}`,
    schema
  );
}

// 4. Tailor the user's CV to a specific job
function tailorCv(cvText, jobDescription) {
  return textCall(
    `Rewrite/tailor this CV to better match the job description below. Emphasize ` +
      `relevant experience and keywords, keep it truthful, and keep it ATS-friendly.\n\n` +
      `=== CV ===\n${cvText}\n\n=== JOB DESCRIPTION ===\n${jobDescription}`,
    2000
  );
}

// 5. Generate interview questions tailored to the job
function interviewPrep(jobDescription, cvText) {
  const schema = {
    type: 'object',
    properties: {
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            suggestedAnswer: { type: 'string' },
            category: { type: 'string' },
          },
          required: ['question', 'suggestedAnswer', 'category'],
          additionalProperties: false,
        },
      },
    },
    required: ['questions'],
    additionalProperties: false,
  };
  return jsonCall(
    `Generate 8 likely interview questions for this role, each with a short suggested ` +
      `answer tailored to the candidate's CV and a category (e.g. technical, behavioral).\n\n` +
      `=== JOB DESCRIPTION ===\n${jobDescription}\n\n=== CV ===\n${cvText || 'No CV provided.'}`,
    schema,
    4000
  );
}

// 6. Suggest improvements to an existing CV (does not rewrite it)
function improveCv(cvText) {
  return textCall(
    `Review this CV and suggest concrete improvements. Return Markdown with a short ` +
      `overall assessment, then a bulleted list of specific, actionable suggestions ` +
      `(wording, structure, missing sections, quantifying achievements, ATS keywords). ` +
      `Do NOT rewrite the whole CV — focus on what to improve and why.\n\n${cvText}`,
    1500
  );
}

module.exports = {
  generateCv,
  careerPaths,
  fitAnalysis,
  tailorCv,
  interviewPrep,
  improveCv,
};
