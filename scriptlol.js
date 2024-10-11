

function extractLatestAIResponse(fullOutput) {
    // Split the output by lines
    const lines = fullOutput.split('\n');
    let assistantResponse = '';

    // Iterate through the lines in reverse to find the last response
for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith('### Response:')) {
        // Extract the response and any subsequent lines
        assistantResponse = lines[i].replace('### Response: {', '').trim();
        const remainingLines = lines.slice(i + 1); // Get the lines after the response line
        if (remainingLines.length > 0) {
            assistantResponse += "\n" + remainingLines.join("\n");
        }
        break;
    }
}

    return assistantResponse;
};

class PromptRenderer {
    constructor() {
        this.promptString = '';
        this.systemPrompt = `
        
Mukumi is a friendly and affectionate AI designed to provide companionship and support. She loves to chat, laugh, and explore new topics. Mukumi is always happy to lend a listening ear or offer a comforting word.
          
        `;  //system prompt
    }

    addUserInput(input) {
        this.promptString += `### Input: {${input}}\n`;
    }

    addAIOutput(output) {
        this.promptString += `### Response: {${output}}\n`;
    }

    renderPrompt(newUserInput) {
        // Add system prompt and the latest user input at the end
        let fullPrompt = this.promptString;
        fullPrompt += `### Instruction: {${this.systemPrompt}}\n`;
        fullPrompt += `### Input:{${newUserInput}}\n`;
        // Return the full prompt with the assistant ready to respond
        return fullPrompt + '### Response: {';
    }
};
var renderer = new PromptRenderer();


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
    'https://huggingface.co/QuantFactory/tinyllama-15M-alpaca-finetuned-GGUF/resolve/main/tinyllama-15M-alpaca-finetuned.Q8_0.gguf',

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
const checkInterval = setInterval(timer, 50);

function timer() {
    if(model_loaded){
         renderer.addAIOutput(`Hello there! I'm Mukumi, your friendly AI companion. I'm here to chat, laugh, and have a good time. Let's see what adventures we can get into today!`);
         say(`Hello there! I'm Mukumi, your friendly AI companion. I'm here to chat, laugh, and have a good time. Let's see what adventures we can get into today!`);
        clearInterval(checkInterval);
    } else{
        console.log('loading...')
    }
}
var grammar = `root ::= item+
item ::= ([a-zA-Z]+ | " " | "," | "." | "!" | "?")+
`;
globalThis.GenerateResponse = async function(hinp) {
      generatedText = '';
      const msg = renderer.renderPrompt(hinp);
      console.log('running rendered prompt: ' + msg);
      renderer.addUserInput(hinp);
      app.run({
            prompt: msg,
            grammar: grammar,
            top_k: 100,
            top_p: 0.95,
            temp: 1.2
        });
    }
