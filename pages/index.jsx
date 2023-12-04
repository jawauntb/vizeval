import { useState, useRef } from 'react';
import ModelResponseComponent from '../components/ModelResponse';
import Head from 'next/head';
import html2canvas from 'html2canvas';

export default function Home() {
  const [models, setModels] = useState([
    'ft:gpt-3.5-turbo-1106:personal::8KXfk56f',
    'gpt-3.5-turbo'
  ]);
  const screenRef = useRef(null);
  const [input, setInput] = useState(''); // Shared input for all models
  const [responses, setResponses] = useState({
    'gpt-3.5-turbo': [],
    'ft:gpt-3.5-turbo-1106:personal::8KXfk56f': [], // Ensure this matches the actual model identifier
    'gpt-4-1106-preview': [],
    'rag-qa-model': [],
    'ft-embed': []
  });

  const [isLoading, setIsLoading] = useState(false); // Shared loading state for all models

  const takeScreenshot = () => {
    html2canvas(screenRef.current).then(canvas => {
      // Create an image
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${input}.png`;
      link.click();
    });
  };

  const leftistPrompt = "You are a leftist policy analyst. Your education encompasses the in-depth study of seminal intellectuals such as bell hooks, Edward Said and Frantz Fanon. You seamlessly integrate their perspectives into every analysis you conduct, ensuring that your work is infused with their groundbreaking insights on race, class, and social dynamics. This approach not only enriches your evaluations but also aligns them with the progressive principles that these thinkers advocated. "

  const newLeftPrompt = "You integrate the perspectives of intellectuals like bell hooks, Edward Said, and Frantz Fanon, Donna Haraway and Donella Meadows into your work. Focus on universal truths and the power of emotions and transformative ideas, rather than just facts. Use logos to inform strong pathos, understanding that influencing opinions often relies more on emotional resonance than data. Center on the inherent truth and empathy of these perspectives without directly naming the intellectuals"

  const basePrompt = "You are a helpful assistant"

  const addModel = () => {
    const newModelName = `Model ${models.length + 1}`;
    setModels([...models, newModelName]);
    setResponses({ ...responses, [newModelName]: [] });
  };

  // Function to remove the last model
  const removeModel = () => {
    if (models.length === 1) {
      // Prevent removing the last model
      alert("At least one model must be present.");
      return;
    }
    const lastModel = models[models.length - 1]; // Get the last model before updating the state
    const newModels = models.slice(0, -1);
    setModels(newModels);

    // Use a functional update to ensure we're working with the latest state
    setResponses(prevResponses => {
      const { [lastModel]: _, ...newResponses } = prevResponses;
      return newResponses;
    });
  };


  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleModelChange = (index) => (e) => {
    const newModels = [...models];
    const oldModel = newModels[index];
    newModels[index] = e.target.value;
    setModels(newModels);

    // Update responses to key them by the new model name
    const newResponses = { ...responses };
    newResponses[e.target.value] = newResponses[oldModel] || [];
    delete newResponses[oldModel];
    setResponses(newResponses);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Create a list of promises for each API request
    const requests = models.map(modelIdentifier => {
      if (modelIdentifier === 'rag-qa-model') {
        // Special handling for the RAG QA model
        return askEmbedding(input).then(responseContent => ({ modelIdentifier, responseContent }));
      } else if (modelIdentifier === 'ft-embed') {
        return askFTEmbedding(input).then(responseContent => ({ modelIdentifier, responseContent }));
      } else {
        const isBase = modelIdentifier == 'ft:gpt-3.5-turbo-1106:personal::8KXfk56f'
        const sysPrompt = isBase ? newLeftPrompt : basePrompt;
        let req = {
          model: modelIdentifier,
          messages: [
            { role: "system", content: sysPrompt },
            { role: "user", content: input }
          ]
        }
        if (isBase) {
          req['max_tokens'] = 4096;
        }
        return makeAPIRequest(req).then(responseContent => ({ modelIdentifier, responseContent }));
      }
    });

    // Wait for all requests to finish
    const results = await Promise.all(requests);

    // Update the state once with all new responses
    setResponses(prevResponses => {
      const newResponses = { ...prevResponses };
      results.forEach(({ modelIdentifier, responseContent }) => {
        newResponses[modelIdentifier] = [...(prevResponses[modelIdentifier] || []), responseContent];
      });
      setIsLoading(false);
      return newResponses;

    });
  };

  const chooseBG = () => {
    const notloading = "bg-gray-900 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded w-full"
    const loading = "metal text-white font-bold py-2 px-4 rounded w-full"
    return isLoading ? loading : notloading
  }

  const getModelBG = () => {
    const notloading = "flex bg-gray-600 flex-col h-screen"
    const loading = "flex metal flex-col h-screen"
    return isLoading ? loading : notloading
  }

  async function askEmbedding(question, timeout = 60000) {  // 30 seconds timeout
    const url = 'https://emojipt-jawaunbrown.replit.app/rag_qa';
    const requestData = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question })
    };

    try {
      const fetchPromise = fetch(url, requestData);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), timeout)
      );
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      if (data && data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        console.error('Unexpected API response:', data);
        return '';
      }
    } catch (error) {
      console.error('Error fetching the response:', error);
      return null;  // or handle error appropriately
    }
  }

  async function askFTEmbedding(question, timeout = 30000) {  // 30 seconds timeout
    const url = 'https://emojipt-jawaunbrown.replit.app/ft_embed';
    const requestData = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question })
    };

    try {
      const fetchPromise = fetch(url, requestData);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), timeout)
      );
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      if (data && data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        console.error('Unexpected API response:', data);
        return '';
      }
    } catch (error) {
      console.error('Error fetching the response:', error);
      return null;  // or handle error appropriately
    }
  }


  // Example usage
  // askQuestion('What is the capital of France?').then(answer => {
  //     console.log('Answer:', answer);
  // });


  async function makeAPIRequest(payload) {
    try {

      const response = await fetch('https://emojipt-jawaunbrown.replit.app/sitesee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payload })
      });

      const data = await response.json();
      if (data && data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        console.error('Unexpected API response:', data);
        return '';
      }
    } catch (error) {
      console.error('Error processing section:', error);
    } // End of try-catch block
  }

  return (
    <div className={getModelBG()} ref={screenRef}>
      <Head>
        <link rel="icon" href="slow.png" /> {/* Path to your favicon */}
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@800&display=swap" rel="stylesheet" />
        <meta property="og:image" content="slow.png" />
      </Head>

      <header className="flex items-center justify-center sand p-4">
        <div className="flex items-center">
          <img className="rounded-md" src="slow.png" width="50" height="50" alt="Logo" />
          <h1 className="text-3xl font-bold ml-4" style={{ fontFamily: 'Raleway, sans-serif', fontSize: '24px' }}>SlowGPT</h1>
        </div>
      </header>
      <div className="flex-grow overflow-auto">
        <div className="flex -mx-1">
          {models.map((model, index) => (
            <div key={index} className="px-1" style={{ width: `${100 / models.length}%` }}>
              <ModelResponseComponent
                model={model}
                isLoading={isLoading}
                onModelChange={handleModelChange(index)}
                responses={responses[model] || []}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 bg-gray-700">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message here..."
          className="bg-gray-800 text-white p-2 rounded w-full mb-2"
        />
        <button
          onClick={handleSubmit}
          className={chooseBG()}
        >
          {isLoading ? 'Loading...' : 'Submit'}
        </button>
      </div>
      <div className="p-4 bg-gray-700 flex flex-row space-x-8 justify-center items-center text-center">
        <button
          onClick={addModel}
          className="bg-gray-900 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
        >
          Add Model
        </button>
        <button
          onClick={removeModel}
          className="bg-gray-900 hover:bg-gray-500  text-white font-bold py-2 px-4 rounded"
        >
          Remove Model
        </button>
        <button
          onClick={takeScreenshot} // Attach the screenshot function here
          className="bg-gray-900 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
        >
          Take Screenshot
        </button>
      </div>
    </div >
  );
}
