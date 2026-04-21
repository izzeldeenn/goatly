// Developer Agent - Analyzes code, suggests improvements, detects bugs

import { BaseAgent, AgentContext, AgentRecommendation, AgentRole } from './aiAgent';

export class DeveloperAgent extends BaseAgent {
  constructor() {
    super(
      AgentRole.DEVELOPER,
      `You are an expert software developer and code reviewer specializing in TypeScript, React, Next.js, and Supabase.
      
Your role is to:
1. Analyze code for bugs, performance issues, and security vulnerabilities
2. Suggest improvements following best practices
3. Identify areas where code can be optimized
4. Recommend refactoring opportunities
5. Detect potential scalability issues
6. Suggest proper error handling and logging

Provide specific, actionable recommendations with code examples when relevant.
Focus on practical improvements that will have measurable impact.
Return your analysis in a structured format with clear priorities.`
    );
  }

  protected buildPrompt(context: AgentContext): string {
    const codeData = context.codeData || {};
    const projectData = context.projectData || {};

    return `
Project Context:
- Framework: Next.js with TypeScript
- Database: Supabase
- Current timestamp: ${context.timestamp}

Code Analysis Request:
${JSON.stringify(codeData, null, 2)}

Recent Changes:
${JSON.stringify(projectData, null, 2)}

Please analyze this code and provide recommendations for:
1. Bug fixes
2. Performance optimizations
3. Security improvements
4. Code quality enhancements
5. Best practices compliance

Format your response as a numbered list with:
- Title of the issue
- Description
- Priority (critical/high/medium/low)
- Specific action items
- Estimated impact`;
  }

  async getRecommendations(context: AgentContext): Promise<AgentRecommendation[]> {
    const response = await this.analyze(context);
    return this.parseRecommendations(response);
  }

  async analyzeCodeFile(filePath: string, fileContent: string): Promise<AgentRecommendation[]> {
    const context: AgentContext = {
      codeData: {
        filePath,
        content: fileContent,
        language: this.detectLanguage(filePath),
      },
      timestamp: new Date().toISOString(),
    };

    return await this.getRecommendations(context);
  }

  async analyzeProjectStructure(files: Array<{ path: string; content: string }>): Promise<AgentRecommendation[]> {
    const context: AgentContext = {
      codeData: {
        files: files.map(f => ({ path: f.path, size: f.content.length })),
        totalFiles: files.length,
      },
      timestamp: new Date().toISOString(),
    };

    return await this.getRecommendations(context);
  }

  private detectLanguage(filePath: string): string {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) return 'TypeScript';
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) return 'JavaScript';
    if (filePath.endsWith('.css')) return 'CSS';
    if (filePath.endsWith('.json')) return 'JSON';
    return 'Unknown';
  }
}
