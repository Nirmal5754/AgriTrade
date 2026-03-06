import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BChats = () => {
  const [chatCrops, setChatCrops] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return null;

  useEffect(() => {
    const loadChats = () => {
      const myBids =
        JSON.parse(localStorage.getItem(`myBids_${user.id}`)) || [];
      const allCrops =
        JSON.parse(localStorage.getItem("allCrops")) || [];

      const now = Date.now();

      const eligible = myBids
        .map((bid) => {
          const crop = allCrops.find((c) => c.id === bid.id);
          if (!crop) return null;

          const auctionEnded = now >= crop.auctionEndTime;

          // 🔓 RUNNING AUCTION → SHOW CARD
          if (!auctionEnded) {
            return crop;
          }

          // 🔐 ENDED AUCTION → SHOW ONLY IF BUYER WON
          const sorted = [...(crop.bidders || [])].sort(
            (a, b) => (b.price || b.bidPrice) - (a.price || a.bidPrice)
          );

          if (sorted[0]?.userId === user.id) {
            return crop;
          }

          return null;
        })
        .filter(Boolean);

      setChatCrops(eligible);
    };

    loadChats();
    window.addEventListener("cropsUpdated", loadChats);
    return () =>
      window.removeEventListener("cropsUpdated", loadChats);
  }, [user.id]);

  const getFarmerName = (crop) =>
    crop.farmerName || crop.farmer || crop.ownerName || "Farmer";

  if (chatCrops.length === 0) {
    return <p style={{ padding: 20 }}>No chats available.</p>;
  }

  return (
    <div className="relative bottom-50 min-w-screen min-h-screen justify-center">
      <h2 className="m-10 font-extrabold text-3xl text-amber-900 text-center">Chats</h2>

      <div className="flex flex-col ml-15 mt-5 items-center">
        {chatCrops.map((crop) => (
          <div
            key={crop.id}
            className="gap-2 flex justify-evenly items-center w-150 border bg-yellow-200 border-white rounded p-3"
          >
            <p>
              <strong className="text-amber-900 font-extrabold">Farmer:</strong> <span className="text-green-700 font-bold">{getFarmerName(crop)}</span> 
            </p>

            <p>
              <strong  className="text-amber-900 font-extrabold">Crop:</strong> <span className="text-green-700 font-bold">{crop.name}</span> 
            </p>

            <button
              onClick={() => navigate(`/bmessage/${crop.id}`)}
            className="rounded-lg bg-green-400 shadow-md shadow-black-200 px-4 py-1 text-amber-900 font-extrabold"
            >
              Chat now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BChats;
