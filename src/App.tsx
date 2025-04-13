import { useState, useEffect } from "react";

function App() {
  const [villagerName, setVillagerName] = useState("");
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

  const handleAddVillager = () => {
    const match = allVillagers.find(
      (v) => v.name.toLowerCase() === villagerName.toLowerCase()
    );

    if (match) {
      setVillagerList([...villagerList, match]);
      setVillagerName("");
    } else {
      alert("Villager not found.");
    }
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
        >
          Add
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {villagerList.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded shadow p-4 text-center space-y-2"
          >
            <img
              src={v.image_uri}
              alt={v.name}
              className="w-24 h-24 mx-auto"
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
