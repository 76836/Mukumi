class TextAggregator {
    constructor() {
        this.fullText = '';
        this.limitedText = '';
    }
    addInput(input) {
        this.fullText += `${input}`;
        this.limitedText += `${input}`;
        this.trimToLimit(10000);  // Adjust limit as needed
    }
    addOutput(output) {
        this.fullText += `${output}`;
        this.limitedText += `${output}`;
        this.trimToLimit(10000);  // Adjust limit as needed
    }
    trimToLimit(limit) {
        while (this.limitedText.length > limit) {
            this.limitedText = this.limitedText.slice(this.limitedText.indexOf('.') + 1);
        }
    }
    getFullText() {
        return this.fullText;
    }
    getLimitedText() {
        return this.limitedText;
    }
};

let aggregator = new TextAggregator();
let modelLoaded = false;
let generatedText = '';

const onLoaded = () => { modelLoaded = true; }
const writeResult = (line) => {
    generatedText += line;
};
const runComplete = () => {
    generatedText = extractLatestAIResponse(generatedText);
    aggregator.addOutput(generatedText);
    say(aggregator.getFullText());
    generatedText = '';
};

const extractLatestAIResponse = (fullOutput) => {
    const lines = fullOutput.split('\n');
    let response = '';
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].startsWith('### Response:')) {
            response = lines[i].replace('### Response:', '').trim();
            response += lines.slice(i + 1).join('');
            break;
        }
    }
    return response;
};

import { LLM } from "./llm.js/llm.js";

const app = new LLM(
    'GGUF_CPU',
    'https://huggingface.co/raincandy-u/TinyStories-656K-Q8_0-GGUF/resolve/main/tinystories-656k-q8_0.gguf',
    onLoaded,
    writeResult,
    runComplete
);

app.load_worker();

const checkInterval = setInterval(() => {
    if (modelLoaded) {
        say(`Loaded`);
        clearInterval(checkInterval);
    }
}, 50);

globalThis.GenerateResponse = async function (input) {
    generatedText = '';
    aggregator.addInput(input);
    app.run({
        prompt: aggregator.getLimitedText(),
        top_k: 100,
        top_p: 0.95,
        temp: 1.2
    });
}
