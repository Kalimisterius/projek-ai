export interface Agent {
  id: string;
  name: string;
  role: string;
}

export interface Task {
  id: string;
  type: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    content: string;
    metadata?: any;
  };
  error?: string;
  createdAt: number;
}

export interface AgentResponse {
  content: string;
  metadata?: any;
}
