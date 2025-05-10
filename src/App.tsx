import { useState, useEffect } from "react";

function App() {
  const [villagerName, setVillagerName] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [villagerList, setVillagerList] = useState<any[]>([]);
  const [allVillagers, setAllVillagers] = useState<any[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const [villagerNotes, setVillagerNotes] = useState<Record<number, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");


  const displayedVillagers = [...villagerList];
  while (displayedVillagers.length < 10) displayedVillagers.push(null);

  // --- Load from backend and localStorage ---
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

    const savedNotes = localStorage.getItem("villagerNotes");
    if (savedNotes) {
      setVillagerNotes(JSON.parse(savedNotes));
    }

    setIsLoaded(true);
  }, [allVillagers]);

  // --- Save to localStorage ---
  useEffect(() => {
    if (!isLoaded) return;
    const ids = villagerList.map((v) => v.id);
    localStorage.setItem("myIsland", JSON.stringify(ids));
  }, [villagerList, isLoaded]);

  useEffect(() => {
    localStorage.setItem("villagerNotes", JSON.stringify(villagerNotes));
  }, [villagerNotes]);

  // --- Core Actions ---
  const handleAddVillager = () => {
    if (villagerList.length >= 10) {
      alert("You can only have 10 villagers on your island!");
      return;
    }

    const match = allVillagers.find(
      (v) => v.name.toLowerCase() === villagerName.toLowerCase()
    );

    if (!match) return alert("Villager not found.");
    if (villagerList.some((v) => v.id === match.id))
      return alert(`${match.name} is already on your island!`);

    setVillagerList([...villagerList, match]);
    setVillagerName("");
    setToastText(`${match.name} added to your island!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSelectVillager = (name: string) => {
    const match = allVillagers.find(
      (v) => v.name.toLowerCase() === name.toLowerCase()
    );
    if (!match) return alert("Villager not found.");
    if (villagerList.some((v) => v.id === match.id))
      return alert(`${match.name} is already on your island!`);
    if (villagerList.length >= 10)
      return alert("You can only have 10 villagers on your island!");

    setVillagerList([...villagerList, match]);
    setVillagerName("");
    setFilteredSuggestions([]);
    setToastText(`${match.name} added to your island!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleRemoveVillager = (id: number) => {
    const removed = villagerList.find((v) => v.id === id);
    setVillagerList(villagerList.filter((v) => v.id !== id));
    if (removed) {
      setToastText(`${removed.name} removed from your island.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleResetIsland = () => {
    const confirmed = window.confirm("Are you sure you want to reset your island? You will lose all your villagers.");
    if (confirmed) {
      setVillagerList([]);
      localStorage.removeItem("myIsland");
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-green-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-green-800">
        🏝️ Animal Crossing Villager Tracker
      </h1>

      {/* Search Bar + Buttons */}
      <div className="flex flex-col items-center relative mb-6 w-full max-w-lg mx-auto">
        <div className="flex items-center gap-4 w-full">
          <input
            id="villager-input"
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
            className="p-2 rounded border w-full"
          />

          <div className="flex flex-col gap-2 pl-4 border-l border-gray-300">
            <button
              onClick={handleAddVillager}
              className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
              disabled={villagerList.length >= 10}
            >
              Add
            </button>
            <button
              onClick={handleResetIsland}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Autocomplete Suggestions */}
        {villagerName.length > 0 && (
          <ul className="list-none absolute top-12 left-0 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-48 overflow-y-auto z-10">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-green-100 cursor-pointer"
                  onClick={() => handleSelectVillager(v.name)}
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
              <li className="px-4 py-2 text-gray-500">No villagers found.</li>
            )}
          </ul>
        )}
      </div>

      {/* Villager Slots */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {displayedVillagers.map((v, index) => (
          <div
            key={v ? v.id : `empty-${index}`}
            className="relative bg-gray-200 rounded-2xl shadow-md p-4 text-center space-y-2 w-full max-w-xs mx-auto min-h-[300px] flex flex-col justify-between items-center transform transition-transform duration-200 hover:scale-105 hover:shadow-xl"
          >
            {v ? (
              <>
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
                  className="w-24 h-24 mx-auto object-contain rounded-full shadow"
                />
                <h2 className="text-lg font-bold text-green-800">{v.name}</h2>
                <p className="text-sm text-gray-600">{v.species}</p>
                <p className="text-sm text-gray-600">🎂 {v.birthday}</p>
                {/* 👇 Display saved note */}
                {villagerNotes[v.id] && (
                  <div
                    className="mt-2 px-3 py-2 bg-green-50 border border-green-300 rounded-xl text-sm text-green-900 italic max-h-24 overflow-y-auto w-full whitespace-pre-wrap break-words shadow-sm"
                  >
                    {villagerNotes[v.id]}
                  </div>
                )}
                {editingNoteId === v.id ? (
                <textarea
                  placeholder="Write a note..."
                  value={villagerNotes[v.id] || ""}
                  onChange={(e) =>
                    setVillagerNotes({ ...villagerNotes, [v.id]: e.target.value })
                  }
                  onBlur={() => setEditingNoteId(null)}
                  className="w-full text-sm p-2 rounded-xl border border-yellow-400 bg-yellow-50 text-yellow-900 italic resize-none shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  rows={3}
                />
              ) : (
                <button
                  onClick={() => setEditingNoteId(v.id)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  📝 Add Note
                </button>
              )}

              </>
            ) : (
              <button
                onClick={() => {
                  const input = document.getElementById("villager-input") as HTMLInputElement;
                  input?.focus();
                }}
                className="flex flex-col items-center justify-center h-full w-full text-gray-400 italic hover:text-green-600 hover:bg-green-100 rounded-lg transition"
              >
                ➕ Add Villager
              </button>
            )}
          </div>
        ))}
      </div>
      {showToast && (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn z-50">
        {toastText}
      </div>
      )}
    </div>
  );
}

export default App;
