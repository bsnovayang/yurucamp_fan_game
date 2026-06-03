document.getElementById("restartBtn").addEventListener("click", newGame);
document.getElementById("saveBtn").addEventListener("click", saveGame);
document.getElementById("loadBtn").addEventListener("click", loadGame);
document.addEventListener("click", (event) => {
  const sellButton = event.target.closest("[data-sell-index]");
  if (!sellButton) return;
  sellItem(Number(sellButton.dataset.sellIndex));
});
document.getElementById("helpBtn").addEventListener("click", () => {
  alert("玩法：先看角色對話。角色提到的期待會變成右側 checklist。商店中黃色標記代表該商品能完成某項期待，也會預覽買下後接近或啟動的 Build。買到符合分類的物品後，目標會打勾；湊齊同類標籤會啟動 Build，週六露營會依完成度與 Build 數演出不同劇情。");
});
newGame();
