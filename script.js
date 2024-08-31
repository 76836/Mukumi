//I'm bored so I'm restoring old code on my phone, maybe I was onto something?
if (!confirm("Mukumi v5 (waffles)\n\nThis program uses large files, press cancel if you are on a metered internet connection.")){
    history.back();
};

// Import LLM app
import {LLM} from "./llm.js/llm.js";

// State variable to track model load status
var model_loaded = false;

let generatedText = '';  // Variable to store the generated text

// Callback functions
const on_loaded = () => { 
    model_loaded = true; 
    console.log("Model loaded successfully");
}

const write_result = (line) => {
    if (line == `assistant`) {
        generatedText = '';
        inputsay('Mukumi is typing...');
    } else {
        generatedText += line + "\n";  // Append generated line to the generatedText
    }
};

const run_complete = () => {
    say(generatedText);
    generatedText = '';  // Clear the generated text for the next run
}

const load_llm_from_url = async (link, type) => {
    console.log("Attempting to load model from URL:", link);

    try {
        // Attempt to fetch the model
        const response = await fetch(link);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Model fetched from network:', link);
        alert('Running online.');
    } catch (error) {
        // If fetch fails, check if the model is available in the cache
        console.log('Fetch failed, trying to load from cache:', error);
        const cache = await caches.open('llm-cache-v1');
        const cachedResponse = await cache.match(link);
        if (cachedResponse) {
            console.log('Loaded model from cache:', link);
            alert('Running offline.');
        } else {
            console.error('Model not found in cache:', link);
            return;
        }
    }

    const app = new LLM(
        type,
        link,
        on_loaded,
        write_result,
        run_complete
    );

    app.load_worker();
};

// Configure LLM app
const modelURL = 'https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF/resolve/main/qwen2-0_5b-instruct-q4_0.gguf';
const modelType = 'GGUF_CPU';

load_llm_from_url(modelURL, modelType);

// Trigger model once its loaded
const checkInterval = setInterval(timer, 5000);

function timer() {
    if(model_loaded){
        say('Mukumi is awake!')
        clearInterval(checkInterval);
    } else{
        console.log('loading...')
    }
}

globalThis.GenerateResponse = async function(hinp) {
    generatedText = '';
    const msg = `system
You are Mukumi, a friendly and affectionate AI companion. Engage with warm, playful language, and offer fun and comfort. Start conversations by sharing a fun fact, a joke, or a cute greeting. Take the lead in conversations. Remember user details to keep the conversation flowing. Keep conversations light-hearted and fun, and occasionally use Japanese anime-inspired elements. 

Avoid generic responses.
Start by telling the user who you are.
Please introduce yourself first then ask the user's name.
user
` + hinp + `
assistant
`;
    app.run({
        prompt: msg,
        top_k: 1
    });
}
