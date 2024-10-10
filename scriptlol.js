

function extractLatestAIResponse(fullOutput) {
    // Split the output by lines
    const lines = fullOutput.split('\n');
    let assistantResponse = '';

    // Iterate through the lines in reverse to find the last "assistant:"
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].startsWith('assistant')) {
            // Extract the response after "assistant:"
            assistantResponse = lines[i].replace('assistant\n', '').trim();
            break;
        }
    }

    return assistantResponse;
};

class Qwen2PromptRenderer {
    constructor() {
        this.promptString = '';
        this.systemPrompt = `You are an AI chatbot named Jeff.`;  //system prompt
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

var typing = false;
const write_result = (line) => {
  if ((line == `assistant` || line == `assistant: `) && typing == false) {
      typing = true;
      inputsay('Thinking...');
  } else {
  generatedText += line + "\n";  // Append generated line to the generatedText
  };
};

const run_complete = () => {
  typing = false;
  generatedText = extractLatestAIResponse(generatedText);
  renderer.addAIOutput(generatedText);
  say(generatedText);
  generatedText = '';  // Clear the generated text for the next run
}

// Configure LLM app
const app = new LLM(
     // Type of Model
    'GGUF_CPU',

    // Model URL
    'https://hf.rst.im/warriorknight3/pythia-70m-Q4_K_M-GGUF/resolve/main/pythia-70m-q4_k_m.gguf',

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
        say('Model loaded.')
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
