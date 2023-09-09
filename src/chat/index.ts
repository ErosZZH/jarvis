import { ChatOpenAI } from "langchain/chat_models/openai"
import { HumanMessage } from "langchain/schema"
import 'dotenv/config'

const chat = new ChatOpenAI({
  temperature: 0,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
  azureOpenAIBasePath: process.env.AZURE_OPENAI_BASE_PATH
});

const result = await chat.predictMessages([
  new HumanMessage("Translate this sentence from English to French. I love programming.")
]);

console.log(result.content)