//trying to fix on pc lol
//current patience 99/100
if (!confirm("Mukumi v7 (cauliflower)\n\nThis program uses large files, press cancel if you are on a metered internet connection.")){
    history.back();
    throw new Error("Abort Script");
};

// Import LLM app
import {LLM} from "./llm.js/llm.js";

// State variable to track model load status
var model_loaded = false;

let generatedText = '';  // Variable to store the generated text

// Callback functions
const on_loaded = () => { 
    model_loaded = true; 
}


const write_result = (line) => {
  if (line == `assistant`) {
      generatedText = '';
      inputsay('Mukumi is typing...');
  } else {
  generatedText += line + "\n";  // Append generated line to the generatedText
  };
};

const run_complete = () => {
  say(generatedText);
  generatedText = '';  // Clear the generated text for the next run
}

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
        say('Mukumi is awake!')
        clearInterval(checkInterval);
    } else{
        console.log('loading...')
    }
}

globalThis.GenerateResponse = async function(hinp) {
      generatedText = '';
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
