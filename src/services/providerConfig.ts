export interface ApiProvider {
  id: string;
  name: string;
  url: string;
  model: string;
  hint: string;
}

export const PROVIDERS: ApiProvider[] = [
  { id: "gemini",    name: "Google Gemini",   url: "https://generativelanguage.googleapis.com", model: "gemini-2.0-flash",         hint: "Starts with AIza..." },
  { id: "openai",    name: "OpenAI",          url: "https://api.openai.com/v1",                 model: "gpt-4o",                   hint: "Starts with sk-..." },
  { id: "openrouter",name: "OpenRouter",      url: "https://openrouter.ai/api/v1",              model: "mistralai/mixtral-8x7b",   hint: "Starts with sk-or-..." },
  { id: "huggingface",name:"Hugging Face",    url: "https://api-inference.huggingface.co",      model: "mistralai/Mixtral-8x7B",   hint: "Starts with hf_..." },
  { id: "groq",      name: "Groq",            url: "https://api.groq.com/openai/v1",            model: "llama3-8b-8192",           hint: "Starts with gsk_..." },
  { id: "mistral",   name: "Mistral AI",      url: "https://api.mistral.ai/v1",                 model: "mistral-medium",           hint: "No prefix pattern" },
  { id: "anthropic", name: "Anthropic Claude",url: "https://api.anthropic.com/v1",              model: "claude-3-5-sonnet-20241022",hint: "Starts with sk-ant-..." },
  { id: "cohere",    name: "Cohere",          url: "https://api.cohere.ai/v1",                  model: "command-r",                hint: "No prefix pattern" },
  { id: "together",  name: "Together AI",     url: "https://api.together.xyz/v1",               model: "meta-llama/Llama-3-8b",    hint: "No prefix pattern" },
  { id: "ollama",    name: "Ollama (Local)",  url: "http://localhost:11434/api",                model: "llama3",                   hint: "No key required" },
  { id: "custom",    name: "Custom Provider", url: "",                                           model: "",                         hint: "Enter your base URL" },
];
