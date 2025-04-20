import { useState, useEffect } from "react";

function App() {
  const [villagerName, setVillagerName] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [villagerList, setVillagerList] = useState<any[]>([]);
  const [allVillagers, setAllVillagers] = useState<any[]>([]);

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

  return (
    <div className="min-h-screen bg-green-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-green-800">
        🏝️ Animal Crossing Villager Tracker
      </h1>

      <div className="flex justify-center gap-2 mb-6">
        <input
          value={villagerName}
          onChange={(e) => setVillagerName(e.target.value)}
          placeholder="Type a villager's name..."
          className="p-2 rounded border w-64"
        />
        <button
          onClick={handleAddVillager}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={villagerList.length >= 10}
        >
          Add
        </button>
      </div>
      

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {villagerList.map((v) => (
          <div
            key={v.id}
            className="relative bg-white rounded-2xl shadow-md p-6 text-center space-y-4 w-full max-w-xs mx-auto"
          >
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
              className="w-28 h-28 mx-auto object-contain"
            />
            <h2 className="font-bold">{v.name}</h2>
            <p>{v.species}</p>
            <p>{v.personality}</p>
            <p>🎂 {v.birthday}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
