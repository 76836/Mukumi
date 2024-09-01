//trying to fix on pc lol
//current patience 100/100
if (!confirm("Mukumi v6 (sour cream)\n\nThis program uses large files, press cancel if you are on a metered internet connection.")){
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

// Fetch the model, try cache first
const fetch_model = async (url) => {
    try {
        const cache = await caches.open('llm-cache-v1');
        const cachedResponse = await cache.match(url);
        if (cachedResponse) {
            console.log('Model loaded from cache:', url);
            return cachedResponse;
        } else {
            console.log('Fetching model from network:', url);
            const response = await fetch(url);
            await cache.put(url, response.clone());
            console.log('Model cached:', url);
            return response;
        }
    } catch (error) {
        console.error('Error fetching model:', error);
    }
};

// Initialize LLM with the offline model
const initLLM = async () => {
    const modelURL = 'https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF/resolve/main/qwen2-0_5b-instruct-q4_0.gguf';
    const response = await fetch_model(modelURL);
    if (response) {
        // Create a blob URL from the response to pass to the LLM constructor
        const blob = await response.blob();
        const localURL = URL.createObjectURL(blob);
        const app = new LLM(
            'GGUF_CPU',
            localURL,
            on_loaded,          
            write_result,       
            run_complete       
        );

        app.load_worker();

        // Trigger model once its loaded
        const checkInterval = setInterval(timer, 5000);
        function timer() {
            if (model_loaded) {
                say('Mukumi is awake!');
                clearInterval(checkInterval);
            } else {
                console.log('loading...');
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
    } else {
        console.error('Failed to load model');
    }
};

initLLM();
// got tired so asked ChatGPT to do all the debugging. i'll see later if that was a good idea.
