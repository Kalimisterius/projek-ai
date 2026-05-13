import { GoogleGenAI } from "@google/genai";

export abstract class BaseAgent {
  public id: string;
  public name: string;
  public role: string;
  public systemPrompt: string;
  protected genAI: GoogleGenAI;

  constructor(id: string, name: string, role: string, systemPrompt: string) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.systemPrompt = systemPrompt;
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }

  async run(prompt: string, fileData?: { mimeType: string, data: string }): Promise<string> {
    try {
      const parts: any[] = [{ text: prompt }];
      
      if (fileData) {
        parts.unshift({
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data
          }
        });
      }

      const response = await this.genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: this.systemPrompt,
        },
      });

      return response.text || "No response generated.";
    } catch (error) {
      console.error(`Error in ${this.name}:`, error);
      throw error;
    }
  }
}
