
    function pickChoice(index) {
      const current = events[state.day];
      const picked = current.choices[index];
      applyEffects(picked.effects);
      addChecks(picked.checks);
      state.log.unshift(`你選擇：「${picked.label}」${picked.desc}`);

      state.mode = "actions";
      state.actionPrompt = picked.nextMode === "shop"
        ? "今天的提示很適合立刻採買。也可以先打工、查資料或休息，但週末前的準備時間有限。"
        : "今天晚上還有一點自由時間。選一個平日行動，讓露營準備往你想要的方向前進。";
      render();
    }


    function advanceDay() {
      if (state.day < 4) {
        state.day += 1;
        state.mode = "event";
      } else {
        state.day = 5;
        state.mode = "camp";
      }
      render();
    }


    function finishWeek2Action() {
      state.week2ActionsUsed += 1;
      if (state.week2ActionsUsed >= state.week2ActionMax) {
        state.mode = "week2Camp";
      } else {
        state.mode = "actions";
        state.actionPrompt = `第二週準備還剩 ${state.week2ActionMax - state.week2ActionsUsed} 次行動。可以繼續採買、打工、查資料或休息。`;
      }
      render();
    }


    function doWeekdayAction(type) {
      if (type === "shop") {
        openShop();
        return;
      }

      if (type === "work") {
        state.budget += 1500;
        state.stamina = Math.max(0, state.stamina - 15);
        state.log.unshift("打工賺到 1500 圓，但體力下降。");
      }

      if (type === "research") {
        state.stamina = Math.max(0, state.stamina - 5);
        state.stats.scenery += 3;
        state.characters.rin.trust += 1;
        state.log.unshift("查了營地天氣與路線，風景體驗上升，凜對你的準備感稍微放心。");
      }

      if (type === "notes") {
        const hinted = state.checklist.filter((c) => c.status !== "done");
        hinted.forEach((c) => {
          state.characters[c.sourceCharacter].tendency += 1;
        });
        state.log.unshift(hinted.length
          ? "整理露營筆記，把角色說過的期待重新確認了一遍。"
          : "整理露營筆記，但目前還沒有未完成的角色期待。");
      }

      if (type === "rest") {
        state.stamina = Math.min(100, state.stamina + 20);
        state.stats.chill += 2;
        state.log.unshift("早點休息，體力恢復，也讓心情比較放鬆。");
      }

      if (type === "skip") {
        state.log.unshift("沒有安排額外行動，直接進入隔天。");
      }

      if (state.week === 2) finishWeek2Action();
      else advanceDay();
    }


    function finishShopping() {
      if (state.week === 2) finishWeek2Action();
      else advanceDay();
    }


    function goToDiary() {
      state.day = 6;
      state.mode = "diary";
      state.finished = true;
      render();
    }


    function startWeek2() {
      const result = campResults();
      const consumed = consumeCampItems();
      state.week = 2;
      state.week2Main = result.main;
      state.day = 0;
      state.mode = "week2";
      state.finished = false;
      state.checklist = [];
      state.campResult = null;
      state.log.unshift(`第二週開始：${state.characters[result.main].name} 的事件傾向提高。`);
      if (consumed.length) {
        state.log.unshift("上一週 checklist 已歸檔，第二週會根據新的 LINE 提示重新建立目標。");
      }
      render();
    }


    function acceptWeek2Hint() {
      acceptWeek2Reply(0);
    }


    function acceptWeek2Reply(index) {
      const route = week2Routes[state.week2Main || campResults().main];
      const reply = route.replies[index] || route.replies[0];
      state.week2Reply = index;
      applyEffects(reply.effects);
      addChecks(route.checks);
      addChecks(reply.extraChecks || []);
      state.log.unshift(`第二週回覆：「${reply.label}」${route.note}`);
      state.mode = "actions";
      state.week2ActionsUsed = 0;
      state.week2CampResult = null;
      state.week2CampChoice = null;
      state.actionPrompt = `第二週準備開始。你有 ${state.week2ActionMax} 次平日行動，請根據 ${state.characters[state.week2Main].name} 的訊息準備這次露營。`;
      render();
    }


    function chooseWeek2Camp(index) {
      state.week2CampChoice = index;
      state.week2CampResult = null;
      render();
    }


    function goToWeek2Diary() {
      week2CampResults();
      state.mode = "week2Diary";
      state.finished = true;
      render();
    }
