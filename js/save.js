
    function saveGame() {
      localStorage.setItem("yurucamp_fan_game_save", JSON.stringify(state));
      state.log.unshift("已存檔。");
      renderLog();
      alert("已存檔。");
    }


    function loadGame() {
      const raw = localStorage.getItem("yurucamp_fan_game_save");
      if (!raw) {
        alert("目前沒有存檔。");
        return;
      }
      state = JSON.parse(raw);
      state.log = state.log || [];
      state.log.unshift("已讀取存檔。");
      render();
    }
