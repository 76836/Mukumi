class TextAggregator {
    constructor() {
        this.text = '';
    }
    addInput(input) {
        this.text += `${input}\n`;
    }
    addOutput(output) {
        this.text += `${output}\n`;
    }
    trimToLimit(limit) {
        while (this.text.length > limit) {
            this.text = this.text.slice(this.text.indexOf('\n') + 1);
        }
    }
};

let aggregator = new TextAggregator();
let modelLoaded = false;
let generatedText = '';

const onLoaded = () => { modelLoaded = true; }
const writeResult = (line) => {
    generatedText += line + "\n";
};
const runComplete = () => {
    generatedText = extractLatestAIResponse(generatedText);
    aggregator.addOutput(generatedText);
    say(generatedText);
    generatedText = '';
};

const extractLatestAIResponse = (fullOutput) => {
    const lines = fullOutput.split('\n');
    let response = '';
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].startsWith('### Response:')) {
            response = lines[i].replace('### Response:', '').trim();
            response += '\n' + lines.slice(i + 1).join('\n');
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
        aggregator.addOutput(`Hello! I'm Mukumi, your friendly AI companion. Let's have some fun today!`);
        say(`Loaded`);
        clearInterval(checkInterval);
    }
}, 50);

globalThis.GenerateResponse = async function (input) {
    generatedText = '';
    aggregator.addInput(input);
    aggregator.trimToLimit(100);
    app.run({
        prompt: aggregator.text,
        top_k: 100,
        top_p: 0.95,
        temp: 1.2
    });
}
