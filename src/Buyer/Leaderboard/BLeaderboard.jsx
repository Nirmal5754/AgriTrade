import React, { useEffect, useState } from "react";

const BLeaderboard = () => {
  const [boards, setBoards] = useState([]);
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  const DEL_KEY = user ? `deletedBidCrops_${user.id}` : null;

  const loadLeaderboard = () => {
    if (!user?.id) return;

    const deleted =
      JSON.parse(localStorage.getItem(DEL_KEY)) || [];

    const allCrops =
      JSON.parse(localStorage.getItem("allCrops")) || [];

    // only crops where buyer placed a bid AND not deleted
    const myCrops = allCrops.filter(
      (c) =>
        !deleted.includes(c.id) &&
        c.bidders?.some((b) => b.userId === user.id)
    );

    const data = myCrops.map((crop) => {
      const bidders = [...(crop.bidders || [])].sort(
        (a, b) => b.price - a.price
      );

      const myIndex = bidders.findIndex(
        (b) => b.userId === user.id
      );

      const ended = Date.now() >= crop.auctionEndTime;
      const status =
        ended && myIndex !== 0 ? "Lost" : ended ? "Won" : "Running";

      return { crop, bidders, myStatus: status };
    });

    setBoards(data);
  };

  useEffect(() => {
    loadLeaderboard();
    window.addEventListener("cropsUpdated", loadLeaderboard);
    return () =>
      window.removeEventListener("cropsUpdated", loadLeaderboard);
  }, []);

  /* 🗑️ DELETE LOST BID (VISIBILITY ONLY) */
  const deleteLostBid = (cropId) => {
    const deleted =
      JSON.parse(localStorage.getItem(DEL_KEY)) || [];

    if (!deleted.includes(cropId)) {
      localStorage.setItem(
        DEL_KEY,
        JSON.stringify([...deleted, cropId])
      );
    }

    window.dispatchEvent(new Event("cropsUpdated"));
  };

  if (boards.length === 0) {
    return <p style={{ padding: 20 }}>No bids placed yet.</p>;
  }

  return (
    <div className="relative bottom-40">
      <h2 className="font-extrabold text-3xl text-center text-amber-900 ">My Leaderboards</h2>

      {boards.map(({ crop, bidders, myStatus }) => {
        const ended = Date.now() >= crop.auctionEndTime;

        return (
          <div
            key={crop.id}
         className="flex flex-col justify-start gap-10 mt-10 mr-240"
          >
            {/* 🗑️ DELETE BUTTON (ONLY IF LOST) */}
            {ended && myStatus === "Lost" && (
              <button
                onClick={() => deleteLostBid(crop.id)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
                title="Remove"
              >
                🗑️
              </button>
            )}

            <strong className="text-xl font-bold text-green-500">{crop.name}</strong>
            <p className="text-amber-900 font-bold">
              Status:{" "}
              <strong className="text-green-700">{ended ? "Ended" : "Running"}</strong>
            </p>
<div className="border border-1 border-gray-200 rounded-lg">
  <table className="w-full" >
              <thead className="bg-yellow-300">
                <tr className="border border-green-300">
                  <th className="p-3">Rank</th>
                  <th className="p-3">Buyer</th>
                  <th className="p-3">Bid</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="bg-amber-700 text-amber-100 font-semibold">
                {bidders.map((b, i) => {
                  let statusText = "Losing";
                  if (!ended && i === 0) statusText = "Winning";
                  if (ended && i === 0) statusText = "Won";
                  if (ended && i !== 0) statusText = "Lost";

                  return (
                    <tr
                      key={b.userId}
                   
                    >
                      <td className="p-3 border-gray-200">{i + 1}</td>
                      <td className="p-3 border-gray-200">{b.name}</td>
                      <td className="p-3 border-gray-200">₹{b.price}</td>
                      <td className="p-3 border-gray-200" >{statusText}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
            
          </div>
        );
      })}
    </div>
  );
};

export default BLeaderboard;
