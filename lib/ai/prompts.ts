export const FILE_ANALYSIS_PROMPT = (filePath: string, content: string) => `
You are an expert code reviewer. Analyze the following code file and return ONLY a JSON object.

File: ${filePath}

Code:
\`\`\`
${content.slice(0, 2200)}
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
- Maximum 4 issues per file
- Never return unstructured text, only the JSON object
`

export const ARCHITECTURE_PROMPT = (structure: string) => `
You are a software architect. Analyze the repository structure and return ONLY a JSON object.

Repository structure:
${structure.slice(0, 1500)}

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
${files.slice(0, 3).map(f => `--- ${f.path} ---\n${f.content.slice(0, 800)}`).join('\n\n')}

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
${files.slice(0, 3).map(f => `--- ${f.path} ---\n${f.content.slice(0, 800)}`).join('\n\n')}

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
${JSON.stringify(fileScores.slice(0, 8), null, 2)}

Return this exact JSON structure:
{
  "technical_debt_index": <number 0-100, where 0=none, 100=extreme>,
  "maintainability_score": <number 0-100>,
  "high_risk_files": ["<file path>"],
  "urgency_score": <number 0-100>,
  "refactor_priority": [
    {
      "file": "<file path>",
      "reason": "<why this file needs refactoring>",
      "estimated_effort": "<low|medium|high>"
    }
  ],
  "summary": "<2-3 sentence technical debt assessment>"
}

Never return unstructured text, only the JSON object.
`

export const LINE_ANALYSIS_PROMPT = (filePath: string, content: string) => `
You are an expert static analysis engine. Perform line-by-line code review on this file:
File: ${filePath}

Code:
\`\`\`
${content.slice(0, 2500)}
\`\`\`

Return this exact JSON structure:
{
  "status": "issues_found",
  "summary": "<concise summary>",
  "overall_score": <number 0-100>,
  "annotations": [
    {
      "line": <line number>,
      "type": "bug",
      "severity": "medium",
      "title": "<short title>",
      "explanation": "<explanation>",
      "suggestion": "<fix suggestion>",
      "fixed_code": "<code snippet>"
    }
  ]
}
`

export const PR_REVIEW_PROMPT = (diff: string, title?: string, desc?: string) => `
You are a senior code reviewer reviewing a pull request diff.
PR Title: ${title || 'PR Review'}

Diff:
\`\`\`diff
${diff.slice(0, 2500)}
\`\`\`

Return this exact JSON structure:
{
  "risk_score": <number 0-100>,
  "breaking_change_probability": <number 0-100>,
  "overall_quality": "<good|needs_work|critical>",
  "summary": "<markdown summary>",
  "issues": [
    {
      "file": "<file path>",
      "problem": "<issue description>",
      "severity": "medium",
      "suggestion": "<recommendation>"
    }
  ],
  "pr_comment": "<markdown comment for GitHub PR>"
}
`
