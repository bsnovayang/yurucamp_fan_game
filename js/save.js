
    function saveGame() {
      state.saveVersion = SAVE_VERSION;
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
      migrateSaveState();
      state.log.unshift("已讀取存檔。");
      render();
    }


    function migrateSaveState() {
      state.saveVersion = state.saveVersion || 1;
      state.stats = Object.assign({ warmth: 0, scenery: 0, cooking: 0, bond: 0, chill: 0 }, state.stats || {});
      state.characters = state.characters || {};
      Object.keys(characters).forEach((id) => {
        state.characters[id] = Object.assign({}, characters[id], state.characters[id] || {});
      });
      state.checklist = state.checklist || [];
      state.bag = (state.bag || []).map(migrateItem);
      state.shop = (state.shop || []).map(migrateItem);
      state.log = state.log || [];
      state.week = state.week || 1;
      state.day = state.day || 0;
      state.mode = state.mode || "event";
      state.budget = typeof state.budget === "number" ? state.budget : 3000;
      state.stamina = typeof state.stamina === "number" ? state.stamina : 60;
      state.loadMax = typeof state.loadMax === "number" ? state.loadMax : 10;
      state.week2Main = state.week2Main || null;
      state.week2ActionsUsed = state.week2ActionsUsed || 0;
      state.week2ActionMax = state.week2ActionMax || 3;
      state.week2CampResult = state.week2CampResult || null;
      state.week2Reply = state.week2Reply ?? null;
      state.week2CampChoice = state.week2CampChoice ?? null;
      state.finished = Boolean(state.finished);
      state.saveVersion = SAVE_VERSION;
    }


    function migrateItem(it) {
      const base = canonicalItem(it.id) || {};
      return Object.assign({}, base, it, { type: it.type || base.type || "gear" });
    }
