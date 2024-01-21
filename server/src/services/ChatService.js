import 'dotenv/config';
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const endpoint = process.env.ENDPOINT;
const azureApiKey = process.env.AZUREAPIKEY;

const messages = [
  { role: "system", content: "You are a helpful assistant. You should response in oral English" },
  { role: "user", content: "I want to speak English with you on some ramdon topics" },
  { role: "assistant", content: "Sure, let's start talking. And I'll using oral English" },
];

export async function chat(message) {
  const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
  const deploymentId = 'chat-model';
  messages.push({ role: "user", content: message });
  const result = await client.getChatCompletions(deploymentId, messages);
  if (result.choices.length === 0) {
    return 'Sorry, I don\'t understand what you said.';
  }
  console.log(result.choices)
  return result.choices[0].message.content;
}