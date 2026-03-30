export const FILE_ANALYSIS_PROMPT = (filePath: string, content: string) => `
You are an expert code reviewer. Analyze the following code file and return ONLY a JSON object.

File: ${filePath}

Code:
\`\`\`
${content.slice(0, 8000)}
\`\`\`

Return this exact JSON structure:
{
  "file_score": <number 0-100>,
  "risk_level": "<low|medium|high|critical>",
  "issues": [
    {
      "file": "${filePath}",
      "problem": "<description of the issue>",
      "severity": "<low|medium|high|critical>",
      "suggestion": "<specific improvement recommendation>",
      "line": <optional line number>
    }
  ]
}

Rules:
- file_score: 100 = perfect, 0 = totally broken
- Detect: code smells, naming issues, complexity, best practice violations
- Maximum 5 issues per file
- Never return unstructured text, only the JSON object
`

export const ARCHITECTURE_PROMPT = (structure: string) => `
You are a software architect. Analyze the repository structure and return ONLY a JSON object.

Repository structure:
${structure}

Return this exact JSON structure:
{
  "architecture_score": <number 0-100>,
  "pattern": "<MVC|layered|monolith|microservices|chaotic|component-based|other>",
  "coupling": "<low|medium|high>",
  "summary": "<2-3 sentence architecture assessment>",
  "issues": [
    {
      "file": "<folder or file>",
      "problem": "<architectural issue>",
      "severity": "<low|medium|high|critical>",
      "suggestion": "<improvement recommendation>"
    }
  ]
}

Analyze: folder structure, separation of concerns, coupling, cohesion, design patterns.
Never return unstructured text, only the JSON object.
`

export const SECURITY_PROMPT = (files: { path: string; content: string }[]) => `
You are a security auditor. Analyze these code files for security vulnerabilities.
Return ONLY a JSON object.

Files:
${files.map(f => `--- ${f.path} ---\n${f.content.slice(0, 3000)}`).join('\n\n')}

Return this exact JSON structure:
{
  "security_score": <number 0-100>,
  "summary": "<2-3 sentence security assessment>",
  "issues": [
    {
      "file": "<file path>",
      "problem": "<security vulnerability description>",
      "severity": "<low|medium|high|critical>",
      "suggestion": "<remediation recommendation>"
    }
  ]
}

Detect: hardcoded secrets/API keys, missing input validation, SQL injection risks,
XSS vulnerabilities, auth bypass risks, insecure dependencies references, exposed tokens.
Never return unstructured text, only the JSON object.
`

export const SCALABILITY_PROMPT = (files: { path: string; content: string }[]) => `
You are a scalability expert. Analyze these code files for scalability issues.
Return ONLY a JSON object.

Files:
${files.map(f => `--- ${f.path} ---\n${f.content.slice(0, 3000)}`).join('\n\n')}

Return this exact JSON structure:
{
  "scalability_score": <number 0-100>,
  "performance_score": <number 0-100>,
  "summary": "<2-3 sentence scalability assessment>",
  "issues": [
    {
      "file": "<file path>",
      "problem": "<scalability issue>",
      "severity": "<low|medium|high|critical>",
      "suggestion": "<improvement recommendation>"
    }
  ]
}

Detect: synchronous blocking operations, missing caching, N+1 queries, missing DB indexes,
stateful design issues, missing async/await, tight loops, memory leaks.
Never return unstructured text, only the JSON object.
`

export const DEBT_PROMPT = (fileScores: { path: string; score: number; issues: number }[]) => `
You are a technical debt analyst. Calculate the technical debt index from these file metrics.
Return ONLY a JSON object.

File metrics:
${JSON.stringify(fileScores, null, 2)}

Return this exact JSON structure:
{
  "technical_debt_index": <number 0-100, where 100 = maximum debt>,
  "maintainability_score": <number 0-100>,
  "high_risk_files": ["<file_path>"],
  "urgency_score": <number 0-10>,
  "refactor_priority": [
    {
      "file": "<file path>",
      "reason": "<why this file should be refactored first>",
      "estimated_effort": "<low|medium|high>"
    }
  ],
  "summary": "<2-3 sentence technical debt summary>"
}

Never return unstructured text, only the JSON object.
`

export const PR_REVIEW_PROMPT = (diff: string, prTitle: string) => `
You are a senior code reviewer. Analyze this GitHub Pull Request diff and return ONLY a JSON object.

PR Title: ${prTitle}

Diff:
\`\`\`
${diff.slice(0, 12000)}
\`\`\`

Return this exact JSON structure:
{
  "risk_score": <number 0-100>,
  "breaking_change_probability": <number 0-100>,
  "overall_quality": "<poor|fair|good|excellent>",
  "summary": "<concise PR review summary>",
  "issues": [
    {
      "file": "<file path>",
      "problem": "<issue description>",
      "severity": "<low|medium|high|critical>",
      "suggestion": "<improvement recommendation>"
    }
  ],
  "pr_comment": "<formatted markdown comment to post on the PR>"
}

Never return unstructured text, only the JSON object.
`

export const LINE_ANALYSIS_PROMPT = (filePath: string, numberedContent: string) => `
You are an expert security and code quality auditor. Perform a PRECISE line-by-line analysis.
Return ONLY a JSON object — no markdown, no explanation.

File: ${filePath}

Code (with line numbers):
${numberedContent.slice(0, 12000)}

Return this EXACT JSON structure:
{
  "status": "<approved|issues_found>",
  "summary": "<2-3 sentence technical assessment>",
  "overall_score": <number 0-100>,
  "annotations": [
    {
      "line": <exact integer line number>,
      "type": "<bug|vulnerability|bad_practice|performance|security>",
      "severity": "<low|medium|high|critical>",
      "title": "<short one-line issue title>",
      "explanation": "<precise technical explanation of why this is problematic>",
      "suggestion": "<brief recommended fix description>",
      "fixed_code": "<exact replacement code snippet>"
    }
  ]
}

RULES:
- Only flag REAL issues with exact line numbers from the numbered code.
- If code is clean: return status "approved", empty annotations [].
- Focus on: hardcoded secrets, SQL injection, unsafe eval, XSS, missing error handling,
  insecure auth, race conditions, memory leaks.
- Max 10 annotations. Return ONLY the JSON object.
`
