// ModelResponseComponent.js
function ModelResponseComponent({ model, onModelChange, isLoading, responses }) {
  // A map of model identifiers to user-friendly display names
  const modelNameMap = {
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'ft:gpt-3.5-turbo-1106:personal::8KXfk56f': 'SlowGPT (Fine-Tuned GPT-3.5)',
    'gpt-4-1106-preview': 'GPT-4 (Preview)',
    'rag-qa-model': 'SlowGPT: (Embeddings + GPT-4)',
    'ft-embed': 'SlowGPT: (Fine-Tune + Embeddings)',
  };

  const chooseBG = () => {
    const notloading = "bg-gray-900 text-white p-2 my-2 rounded"
    const loading = "metal text-white p-2 my-2 rounded"
    return isLoading ? loading : notloading
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2">
        <select
          value={model}
          onChange={onModelChange}
          className="bg-gray-900 text-white p-2 rounded w-full"
        >
          {Object.entries(modelNameMap).map(([value, name]) => (
            <option key={value} value={value}>{name}</option>
          ))}
        </select>
      </div>
      <div className="flex-grow overflow-y-auto p-2">
        {/* Render responses here */}
        {responses.map((response, index) => (
          <div key={index} className={chooseBG()}>
            {response}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModelResponseComponent;
