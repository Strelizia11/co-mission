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
  const [activeTab, setActiveTab] = useState<"home" | "post" | "myMissions">("home");
  const [quests, setQuests] = useState<
    {
      id: number;
      title: string;
      description: string;
      reward: string;
      taken: boolean;
      author: string;
      expiresAt: number;
      closed: boolean; // new field
    }[]
  >([]);

  const [newQuest, setNewQuest] = useState({
    title: "",
    description: "",
    reward: "",
    duration: 60,
  });

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

  // Timer: auto-close instead of auto-delete
  useEffect(() => {
    const interval = setInterval(() => {
      setQuests((prev) =>
        prev.map((q) =>
          !q.closed && Date.now() >= q.expiresAt ? { ...q, closed: true } : q
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePostQuest = () => {
    if (!newQuest.title || !newQuest.description || !newQuest.reward) return;

    const userAddress = context?.user?.wallet?.address || "anonymous";

    setQuests((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title: newQuest.title,
        description: newQuest.description,
        reward: newQuest.reward,
        taken: false,
        author: userAddress,
        expiresAt: Date.now() + newQuest.duration * 1000,
        closed: false,
      },
    ]);

    setNewQuest({ title: "", description: "", reward: "", duration: 60 });
    setActiveTab("myMissions");
  };

  const handleClaimMission = (id: number) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, taken: true } : q))
    );
  };

  const handleCloseMission = (id: number) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, closed: true } : q))
    );
  };

  const handleDeleteMission = (id: number) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
  };

  const myMissions = quests.filter(
    (q) => q.author === (context?.user?.wallet?.address || "anonymous")
  );

  const formatTimeLeft = (expiresAt: number, closed: boolean) => {
    if (closed) return "Closed";
    const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}m ${seconds}s`;
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
          <button
            className={`px-3 py-2 rounded ${
              activeTab === "myMissions" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("myMissions")}
          >
            My Missions
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
                      <p className="text-xs text-gray-500">
                        {quest.closed
                          ? "Status: Closed"
                          : `Expires in: ${formatTimeLeft(quest.expiresAt, quest.closed)}`}
                      </p>
                      {quest.taken && <span className="text-green-600 text-sm">✅ Taken</span>}
                      {!quest.taken && !quest.closed && (
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
              <input
                type="number"
                placeholder="Duration in seconds"
                value={newQuest.duration}
                onChange={(e) =>
                  setNewQuest({ ...newQuest, duration: Number(e.target.value) })
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

          {activeTab === "myMissions" && (
            <div>
              {myMissions.length === 0 ? (
                <p className="text-center text-gray-500">
                  You haven’t posted any missions yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {myMissions.map((quest) => (
                    <li
                      key={quest.id}
                      className="border rounded-lg p-3 bg-white shadow-sm"
                    >
                      <h3 className="font-semibold">{quest.title}</h3>
                      <p className="text-sm text-gray-600">{quest.description}</p>
                      <p className="text-sm mt-1">Reward: {quest.reward}</p>
                      <p className="text-xs text-gray-500">
                        {quest.closed
                          ? "Status: Closed"
                          : `Expires in: ${formatTimeLeft(quest.expiresAt, quest.closed)}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        Status: {quest.closed ? "Closed" : quest.taken ? "Taken" : "Open"}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {!quest.closed && (
                          <button
                            className="px-3 py-1 bg-yellow-500 text-white rounded"
                            onClick={() => handleCloseMission(quest.id)}
                          >
                            Close Commission
                          </button>
                        )}
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded"
                          onClick={() => handleDeleteMission(quest.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
