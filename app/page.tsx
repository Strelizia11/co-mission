"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "post">("home");
  const [quests, setQuests] = useState<
    { id: number; title: string; description: string; reward: string; taken: boolean }[]
  >([]);

  const [newQuest, setNewQuest] = useState({ title: "", description: "", reward: "" });

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <span>Saved</span>
        </div>
      );
    }
    return null;
  }, [frameAdded]);

  // Add new quest
  const handlePostQuest = () => {
    if (!newQuest.title || !newQuest.description || !newQuest.reward) return;
    setQuests((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title: newQuest.title,
        description: newQuest.description,
        reward: newQuest.reward,
        taken: false,
      },
    ]);
    setNewQuest({ title: "", description: "", reward: "" });
    setActiveTab("home");
  };

  // Freelancer claims mission
  const handleClaimMission = (id: number) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, taken: true } : q))
    );
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        {/* Header with wallet */}
        <header className="flex justify-between items-center mb-3 h-11">
          
          <div>{saveFrameButton}</div>
        </header>

        {/* Navigation */}
        <nav className="flex justify-around mb-4">
          <button
            className={`px-3 py-2 rounded ${
              activeTab === "home" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("home")}
          >
            Browse Missions
          </button>
          <button
            className={`px-3 py-2 rounded ${
              activeTab === "post" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("post")}
          >
            Post Mission
          </button>
        </nav>

        {/* Main content */}
        <main className="flex-1">
          {activeTab === "home" && (
            <div>
              {quests.length === 0 ? (
                <p className="text-center text-gray-500">No missions yet. Post one!</p>
              ) : (
                <ul className="space-y-3">
                  {quests.map((quest) => (
                    <li
                      key={quest.id}
                      className="border rounded-lg p-3 bg-white shadow-sm"
                    >
                      <h3 className="font-semibold">{quest.title}</h3>
                      <p className="text-sm text-gray-600">{quest.description}</p>
                      <p className="text-sm mt-1">Reward: {quest.reward}</p>
                      {quest.taken ? (
                        <span className="text-green-600 text-sm">✅ Taken</span>
                      ) : (
                        <button
                          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
                          onClick={() => handleClaimMission(quest.id)}
                        >
                          Claim Mission
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "post" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Mission Title"
                value={newQuest.title}
                onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
                className="w-full border rounded p-2"
              />
              <textarea
                placeholder="Mission Description"
                value={newQuest.description}
                onChange={(e) =>
                  setNewQuest({ ...newQuest, description: e.target.value })
                }
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                placeholder="Reward (e.g. 0.01 ETH)"
                value={newQuest.reward}
                onChange={(e) =>
                  setNewQuest({ ...newQuest, reward: e.target.value })
                }
                className="w-full border rounded p-2"
              />
              <button
                className="w-full py-2 bg-green-600 text-white rounded"
                onClick={handlePostQuest}
              >
                Post Mission
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
