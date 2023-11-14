import { useState } from 'react';

export default function Home() {
  const [modelA, setModelA] = useState('Model 1');
  const [modelB, setModelB] = useState('Model 2');
  const [input, setInput] = useState('');
  const [responses, setResponses] = useState({ modelA: [], modelB: [] });

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = () => {
    // Placeholder for submitting to models
    // You would replace this with the actual logic for sending the input to the models
    // and appending their responses to the responses state.
    setResponses({
      ...responses,
      modelA: [...responses.modelA, `Response from ${modelA}`],
      modelB: [...responses.modelB, `Response from ${modelB}`],
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      <div className="flex-none p-4 shadow-md">
        <h1 className="text-center text-2xl font-bold">Vizeval</h1>
      </div>
      <div className="flex-grow p-4 flex">
        <div className="flex-1 border-r border-gray-700 p-4">
          <h2 className="text-center mb-4">{modelA}</h2>
          <div className="overflow-y-auto mb-4" style={{ height: 'calc(100% - 64px)' }}>
            {/* Messages for model A */}
            {responses.modelA.map((response, index) => (
              <div key={index} className="bg-gray-700 p-2 my-2 rounded">
                {response}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4">
          <h2 className="text-center mb-4">{modelB}</h2>
          <div className="overflow-y-auto mb-4" style={{ height: 'calc(100% - 64px)' }}>
            {/* Messages for model B */}
            {responses.modelB.map((response, index) => (
              <div key={index} className="bg-gray-700 p-2 my-2 rounded">
                {response}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-none p-4">
        <div className="flex bg-gray-900 rounded p-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="flex-grow p-2 bg-gray-800 rounded-l"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 rounded-r px-4"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
