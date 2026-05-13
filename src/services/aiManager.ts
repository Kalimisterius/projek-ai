import { AICoder, AITester, AISecurity, AIDatabase, AIChatbot, AIDesigner } from "./agents";
import { BaseAgent } from "./BaseAgent";

export class AIManager {
  private agents: Map<string, BaseAgent> = new Map();

  constructor() {
    this.agents.set("ai-coder", new AICoder());
    this.agents.set("ai-tester", new AITester());
    this.agents.set("ai-security", new AISecurity());
    this.agents.set("ai-db", new AIDatabase());
    this.agents.set("ai-designer", new AIDesigner());
    this.agents.set("ai-chatbot", new AIChatbot());
  }

  getAgents() {
    return Array.from(this.agents.values()).map(a => ({
      id: a.id,
      name: a.name,
      role: a.role
    }));
  }

  async runTask(agentId: string, prompt: string, fileData?: { mimeType: string, data: string }) {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error("Agent not found");
    return await agent.run(prompt, fileData);
  }

  async coordinate(message: string, fileData?: { mimeType: string, data: string }) {
    const manager = this.agents.get("ai-chatbot");
    if (!manager) throw new Error("Manager agent not found");
    
    // In an enhanced version, we could implement a routing logic here
    // but for now we follow the instruction to use the manager for coordination
    return await manager.run(message, fileData);
  }
}

export const aiManager = new AIManager();
