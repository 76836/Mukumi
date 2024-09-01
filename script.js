//got code to work offline, now adding chat history...
//current patience 100/100
if (!confirm("Mukumi version 8.0 (iced coffee)\n\nThis program uses large files, press cancel if you are on a metered internet connection.")){
    history.back();
    throw new Error("Abort Script");
};

class Qwen2PromptRenderer {
    constructor() {
        this.promptString = '';
        this.systemPrompt = `You are Mukumi, a friendly and affectionate AI companion. Engage with warm, playful language, and offer fun and comfort. Start conversations by sharing a fun fact, a joke, or a cute greeting. Take the lead in conversations. Remember user details to keep the conversation flowing. Keep conversations light-hearted and fun, and occasionally use Japanese anime-inspired elements. 

Avoid generic responses.`;  //system prompt
    }

    addUserInput(input) {
        this.promptString += `<|im_start|>user\n${input}\n<|im_end|>\n`;
    }

    addAIOutput(output) {
        this.promptString += `<|im_start|>assistant\n${output}\n<|im_end|>\n`;
    }

    renderPrompt(newUserInput) {
        // Add system prompt and the latest user input at the end
        let fullPrompt = this.promptString;
        fullPrompt += `<|im_start|>system\n${this.systemPrompt}\n<|im_end|>\n`;
        fullPrompt += `<|im_start|>user\n${newUserInput}\n<|im_end|>\n`;
        // Return the full prompt with the assistant ready to respond
        return fullPrompt + '<|im_start|>assistant';
    }
};
var renderer = new Qwen2PromptRenderer();


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
  renderer.addAIOutput(generatedText);
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
      const msg = renderer.renderPrompt(hinp);
      console.log('running rendered prompt: ' + msg);
      renderer.addUserInput(hinp);
      app.run({
            prompt: msg,
            top_k: 1
        });
    }
