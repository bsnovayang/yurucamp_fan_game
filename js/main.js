document.getElementById("restartBtn").addEventListener("click", newGame);
document.getElementById("saveBtn").addEventListener("click", saveGame);
document.getElementById("loadBtn").addEventListener("click", loadGame);
document.getElementById("helpBtn").addEventListener("click", () => {
  alert("玩法：先看角色對話。角色提到的期待會變成右側 checklist。商店中黃色標記代表該商品能完成某項期待。買到符合分類的物品後，目標會打勾。週六露營會依完成度演出不同劇情。");
});
newGame();
