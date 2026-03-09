import { ApiConfig } from '../hooks/useApiConfig';

export interface NormalizedResponse {
  text: string;
  provider: string;
  model: string;
  tokensUsed?: number;
}

export interface ApiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export const callAiApi = async (config: ApiConfig, prompt: string | ApiPart[]): Promise<NormalizedResponse> => {
  const { provider, model, apiKey, baseUrl } = config;

  const isMultimodal = Array.isArray(prompt);
  const textPrompt = isMultimodal 
    ? prompt.find(p => p.text)?.text || '' 
    : prompt as string;

  try {
    if (provider === 'gemini') {
      const url = `${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const body = isMultimodal 
        ? { contents: [{ parts: prompt }] }
        : { contents: [{ parts: [{ text: prompt }] }] };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);
      const data = await response.json();
      return {
        text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
        provider,
        model
      };
    }

    // For other providers, if multimodal is requested but not supported by this adapter yet, 
    // we fallback to text-only or throw an error if it's critical.
    // Most OpenAI-compatible APIs don't support the Gemini 'parts' format directly.
    
    if (provider === 'anthropic') {
      const response = await fetch(`${baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: textPrompt }],
          max_tokens: 1024
        })
      });

      if (!response.ok) throw new Error(`Anthropic API error: ${response.statusText}`);
      const data = await response.json();
      return {
        text: data.content?.[0]?.text || '',
        provider,
        model
      };
    }

    if (provider === 'huggingface') {
      const response = await fetch(`${baseUrl}/models/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ inputs: prompt })
      });

      if (!response.ok) throw new Error(`Hugging Face API error: ${response.statusText}`);
      const data = await response.json();
      // HF response format varies by model, but often it's an array of objects
      const text = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
      return {
        text: text || '',
        provider,
        model
      };
    }

    // OpenAI-compatible (OpenRouter, Groq, Together, Mistral, Ollama)
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) throw new Error(`${provider} API error: ${response.statusText}`);
    const data = await response.json();
    return {
      text: data.choices?.[0]?.message?.content || '',
      provider,
      model,
      tokensUsed: data.usage?.total_tokens
    };

  } catch (error) {
    console.error('API Adapter Error:', error);
    throw error;
  }
};
