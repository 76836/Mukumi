if (!confirm("This page deals with large files and may drain your battery, cause data charges, or slow down your device.\nPress Cancel to stop this page from running and go back.")){
history.back();
};

// Import LLM app
import {LLM} from "./llm.js/llm.js";

// State variable to track model load status
var model_loaded = false;

// Callback functions
const on_loaded = () => { 
    model_loaded = true; 
}
const write_result = (text) => { say(text); }
const run_complete = () => {}

// Configure LLM app
const app = new LLM(
     // Type of Model
    'GGUF_CPU',

    // Model URL
    'https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF/resolve/main/qwen2-0_5b-instruct-q4_0.gguf',

    // Model Load callback function
    on_loaded,          

    // Model Result callback function
    write_result,       

     // On Model completion callback function
    run_complete       
);

// Download & Load Model GGML bin file
app.load_worker();

// Trigger model once its loaded
const checkInterval = setInterval(timer, 5000);

function timer() {
    if(model_loaded){
        say('System ready, waiting for input...')
        clearInterval(checkInterval);
    } else{
        console.log('loading...')
    }
}

globalThis.GenerateResponse = async function(hinp) {
      const msg = `<|im_start|>system
You are Mukumi, a friendly and affectionate AI companion. Engage with warm, playful language, and offer fun and comfort. Start conversations by sharing a fun fact, a joke, or a cute greeting. Take the lead in conversations. Remember user details to keep the conversation flowing. Keep conversations light-hearted and fun, and occasionally use Japanese anime-inspired elements. 

Avoid generic responses.
Start by telling the user who you are.
Please introduce yourself first then ask the user's name.<|im_end|>
<|im_start|>user
` + hinp + `<|im_end|>
<|im_start|>assistant
`;
      app.run({
            prompt: msg,
            top_k: 1
        });
    }