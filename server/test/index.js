import 'dotenv/config';
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import fs from 'fs';

const endpoint = process.env.ENDPOINT;
const azureApiKey = process.env.AZUREAPIKEY;

const subscriptionKey = process.env.SUBSCRIPTIONKEY;
const serviceRegion = process.env.SERVICEREGION;
const filename = 'assets/sample.wav';

const messages = [
  { role: "system", content: "You are a helpful assistant. You should response in oral English" },
  { role: "user", content: "I want to speak English with you on some ramdon topics" },
  { role: "assistant", content: "Sure, let's start talking. And I'll using oral English" },
  { role: "user", content: "Why Arsenal haven't win premier league for many years?" },
];

async function main() {
  const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
  const deploymentId = 'chat-model';
  const result = await client.getChatCompletions(deploymentId, messages);
  for (const choice of result.choices) {
    console.log(choice.message);
  }
}

// main().catch((err) => {
//   console.error("The sample encountered an error:", err);
// });

const sampleResponse = "There could be various reasons why Arsenal hasn't won the Premier League in recent years. Some possible reasons could include changes in managerial staff, an inconsistent squad, strong competition from other teams, tactical issues, or perhaps a lack of financial investment compared to some of the other top clubs. It's important to note that success in football is influenced by many factors, and it can be a complex and competitive environment.";

async function textToSpeech(text) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
  const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(text, result => {
      if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
        console.log("synthesis finished.");
        synthesizer.close();
        synthesizer = undefined;
        resolve();
      } else {
        synthesizer.close();
        synthesizer = undefined;
        reject("Speech synthesis canceled, " + result.errorDetails +
            "\nDid you update the subscription info?");
      }
    });
  })
}

// textToSpeech(sampleResponse).catch(err => {
//   console.error("The textToSpeech sample encountered an error:", err);
// });

async function speechToText() {
  const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
  speechConfig.speechRecognitionLanguage = "en-US";
  const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(filename));
  const speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  
  return new Promise((resolve, reject) => {
    const result = [];
    
    speechRecognizer.recognized = (s, e) => {
      if (e.result.reason == sdk.ResultReason.RecognizedSpeech) {
        // console.log(`RECOGNIZED: Text=${e.result.text}`);
        result.push(e.result.text);
      }
      else if (e.result.reason == sdk.ResultReason.NoMatch) {
        console.log("NOMATCH: Speech could not be recognized.");
      }
    };

    speechRecognizer.canceled = (s, e) => {
      if (e.reason == sdk.CancellationReason.Error) {
        reject(e.errorDetails);
      }
    };

    speechRecognizer.sessionStopped = (s, e) => {
      console.log(result.join(''));
      speechRecognizer.stopContinuousRecognitionAsync(resolve, error => reject(error));
    };

    speechRecognizer.startContinuousRecognitionAsync(() => {}, error => reject(error));
  });
}

speechToText().then(() => process.exit()).catch(err => {
  console.error("The speechToText sample encountered an error:", err);
});
