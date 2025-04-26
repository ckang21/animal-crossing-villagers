import { useState, useEffect } from "react";

function App() {
  const [villagerName, setVillagerName] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [villagerList, setVillagerList] = useState<any[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const [allVillagers, setAllVillagers] = useState<any[]>([]);
  const displayedVillagers = [...villagerList];


  // Load the local data from your backend
  useEffect(() => {
    const fetchVillagers = async () => {
      const res = await fetch("http://localhost:4000/villagers");
      const data = await res.json();
      setAllVillagers(data);
    };
    fetchVillagers();
  }, []);
  useEffect(() => {
    if (allVillagers.length === 0) return;
  
    const saved = localStorage.getItem("myIsland");
    if (saved) {
      const savedIds: number[] = JSON.parse(saved);
  
      const hydrated = savedIds
        .map((id) => allVillagers.find((v) => v.id === id))
        .filter(Boolean);
  
      setVillagerList(hydrated);
    }
  
    // ✅ Set the loaded flag here
    setIsLoaded(true);
  }, [allVillagers]);
  
  

  useEffect(() => {
    if (!isLoaded) return; // 🚫 Don't save on first render
    const ids = villagerList.map((v) => v.id);
    localStorage.setItem("myIsland", JSON.stringify(ids));
  }, [villagerList, isLoaded]);
  
  const handleAddVillager = () => {
    if (villagerList.length >= 10) {
      alert("You can only have 10 villagers on your island!");
      return;
    }
  
    const match = allVillagers.find(
      (v) => v.name.toLowerCase() === villagerName.toLowerCase()
    );
  
    if (!match) {
      alert("Villager not found.");
      return;
    }
  
    const alreadyAdded = villagerList.some(
      (v) => v.id === match.id
    );
  
    if (alreadyAdded) {
      alert(`${match.name} is already on your island!`);
      return;
    }
  
    setVillagerList([...villagerList, match]);
    setVillagerName("");
  };
  

  const handleRemoveVillager = (id: number) => {
    setVillagerList(villagerList.filter((v) => v.id !== id));
  };

  const handleResetIsland = () => {
    const confirmed = window.confirm("Are you sure you want to reset your island? You will lose all your villagers.")
    if (confirmed) {
      setVillagerList([]);
      localStorage.removeItem("myIsland");
    }
  }

  while (displayedVillagers.length < 10) {
    displayedVillagers.push(null);
  }

  return (
    <div className="min-h-screen bg-green-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-green-800">
        🏝️ Animal Crossing Villager Tracker
      </h1>

      <div className="flex flex-col items-center relative mb-6">
        <input
          value={villagerName}
          onChange={(e) => {
            const input = e.target.value;
            setVillagerName(input);

            if (input.length > 0) {
              const matches = allVillagers.filter((v) =>
                v.name.toLowerCase().includes(input.toLowerCase())
              );
              setFilteredSuggestions(matches.slice(0, 5));
            } else {
              setFilteredSuggestions([]);
            }
          }}
          placeholder="Type a villager's name..."
          className="p-2 rounded border w-64"
        />

        {/* Autocomplete Suggestions */}
        {villagerName.length > 0 && (
        <ul className="list-none absolute top-12 w-64 bg-white border border-gray-300 rounded-lg shadow-md max-h-48 overflow-y-auto z-10">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((v) => (
              <li
                key={v.id}
                className="flex items-center gap-2 px-4 py-2 hover:bg-green-100 cursor-pointer"
                onClick={() => {
                  setVillagerName(v.name);
                  setFilteredSuggestions([]);
                }}
              >
                <img
                  src={
                    typeof v.image_uri === "string" &&
                    (v.image_uri.endsWith(".png") ||
                      v.image_uri.endsWith(".jpg") ||
                      v.image_uri.endsWith(".jpeg"))
                      ? require(`./assets/${v.image_uri}`)
                      : v.image_uri
                  }
                  alt={v.name}
                  className="w-6 h-6 rounded-full object-contain"
                />
                {v.name}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">
              No villagers found.
            </li>
          )}
        </ul>
      )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAddVillager}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={villagerList.length >= 10}
          >
            Add
          </button>

          <button
            onClick={handleResetIsland}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reset Island
          </button>
        </div>
      </div>

      {displayedVillagers.map((v, index) => (
      <div
        key={v ? v.id : `empty-${index}`}
        className="relative bg-grey-200 rounded-2xl shadow-md p-4 text-center space-y-2 w-full max-w-xs mx-auto min-h-[280px] flex flex-col justify-between items-center"
      >
        {v ? (
          <>
          {/* ❌ Remove Button */}
          <button
            onClick={() => handleRemoveVillager(v.id)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            aria-label="Remove"
          >
            ❌
          </button>
        
          <img
            src={
              typeof v.image_uri === "string" &&
              (v.image_uri.endsWith(".png") ||
                v.image_uri.endsWith(".jpg") ||
                v.image_uri.endsWith(".jpeg"))
                ? require(`./assets/${v.image_uri}`)
                : v.image_uri
            }
            alt={v.name}
            className="w-24 h-24 mx-auto mb-2 object-contain rounded-full shadow"
          />
        
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-green-800">{v.name}</h2>
            <p className="text-sm text-gray-600">{v.species}</p>
            <p className="text-sm text-gray-600">🎂 {v.birthday}</p>
          </div>
        </>
        
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 italic">Villager Available</div>
        )}
      </div>
    ))}
    </div>
  );
}

export default App;
