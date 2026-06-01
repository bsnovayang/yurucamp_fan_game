var state;
var days = window.GameData.days;
var daySubtitles = window.GameData.daySubtitles;
var characters = window.GameData.characters;
var items = window.GameData.items;
var events = window.GameData.events;
var week2Routes = window.GameData.week2Routes;


    function newGame() {
      state = {
        week: 1,
        day: 0,
        mode: "event",
        budget: 3000,
        stamina: 60,
        loadMax: 10,
        stats: { warmth: 0, scenery: 0, cooking: 0, bond: 0, chill: 0 },
        characters: JSON.parse(JSON.stringify(characters)),
        checklist: [],
        bag: [],
        shop: [],
        log: ["週一開始。目標是把角色說過的小事，變成露營當天的準備。"],
        campResult: null,
        week2Main: null,
        week2ActionsUsed: 0,
        week2ActionMax: 3,
        week2CampResult: null,
        week2Reply: null,
        week2CampChoice: null,
        finished: false
      };
      delete state.characters.player.affection;
      render();
    }


    function totalLoad() {
      return state.bag.reduce((sum, it) => sum + it.weight, 0);
    }


    function doneChecks() {
      return state.checklist.filter((c) => c.status === "done").length;
    }


    function addChecks(checks) {
      checks.forEach((next) => {
        if (!state.checklist.some((c) => c.id === next.id)) {
          state.checklist.push(next);
          state.log.unshift(`${state.characters[next.sourceCharacter].name} 的提示已記錄：「${next.label}」。`);
        }
      });
      updateChecklistStatus();
    }


    function applyEffects(effects) {
      Object.keys(effects || {}).forEach((key) => {
        if (state.characters[key]) {
          Object.keys(effects[key]).forEach((stat) => {
            state.characters[key][stat] += effects[key][stat];
          });
        } else if (key in state.stats) {
          state.stats[key] += effects[key];
        } else if (key === "stamina") {
          state.stamina = Math.max(0, Math.min(100, state.stamina + effects[key]));
        }
      });
    }


    function updateChecklistStatus(fromPurchase) {
      state.checklist.forEach((c) => {
        const wasDone = c.status === "done";
        const matched = state.bag.some((it) => c.requiredTags.some((tag) => it.tags.includes(tag)));
        c.status = matched ? "done" : "hinted";
        if (fromPurchase && !wasDone && matched) {
          const charName = state.characters[c.sourceCharacter].name;
          state.log.unshift(`Checklist 完成：${charName} 的「${c.label}」。`);
        }
      });
    }


    function campResults() {
      if (state.campResult) return state.campResult;
      const hasWarm = isCheckDone("rin_warm");
      const hasDrink = isCheckDone("rin_drink");
      const hasFood = isCheckDone("nade_food");
      const hasBudget = isCheckDone("chiaki_budget");
      const hasAoiComfort = isCheckDone("aoi_onsen");
      const hasEnaChikuwa = isCheckDone("ena_chikuwa");
      const completed = doneChecks();
      const total = Math.max(1, state.checklist.length);
      const percent = completed / total;
      const main = highestTendency();
      const score = Math.round(
        state.stats.warmth + state.stats.scenery + state.stats.cooking + state.stats.bond + state.stats.chill +
        state.stamina + completed * 10
      );

      const beats = [];
      if (!hasWarm) {
        beats.push("夜晚變冷時，主角開始發抖。凜默默遞出備用暖暖包，沒有多說什麼，但你把這次失誤記進了露營筆記。");
        state.characters.rin.trust += 1;
      } else if (hasWarm && hasDrink) {
        beats.push("營火旁，你拿出熱飲和保暖用品。凜接過杯子，看著湖面說：「準備得很周到。」這句話很短，但很像她。");
        state.characters.rin.affection += 4;
        state.characters.rin.sync += 4;
      } else {
        beats.push("湖邊確實很冷，但你準備的保暖物品派上用場。凜看了看你的背包，似乎稍微放心了。");
        state.characters.rin.affection += 2;
        state.characters.rin.sync += 2;
      }

      if (!hasFood) {
        beats.push("晚餐時間才發現熱食準備不足。撫子拿出備用泡麵，笑著說這也是露營的味道。雖然有點狼狽，但氣氛沒有冷掉。");
        state.characters.nadeshiko.affection += 1;
      } else {
        beats.push("熱呼呼的晚餐讓撫子眼睛發亮。她一邊吹涼湯匙，一邊已經開始討論下次想吃什麼。");
        state.characters.nadeshiko.affection += 4;
        state.characters.nadeshiko.trust += 2;
      }

      if (!hasBudget) {
        beats.push("千明看著帳單大喊預算快炸了，但還是把大家逗笑。她說下次一定要讓你見識真正的省錢露營。");
        state.characters.chiaki.affection += 1;
      } else if (hasBudget && hasFood) {
        beats.push("千明展示你們準備的省錢改造，還成功支援了晚餐。她得意地宣布：這就是野活的勝利。");
        state.characters.chiaki.affection += 4;
        state.characters.chiaki.trust += 3;
      } else {
        beats.push("省錢道具在搭營時派上用場。千明拍著你的肩膀，說你已經很有野活精神了。");
        state.characters.chiaki.affection += 3;
      }

      if (!hasAoiComfort) {
        beats.push("收拾完裝備時，葵笑著說如果有熱茶或泡湯就更完美了。她語氣很輕，你卻記住了這個冬露收尾。");
        state.characters.aoi.affection += 1;
      } else {
        beats.push("你準備了露營後能放鬆的東西。葵捧著熱茶，半開玩笑地說這樣就算被風吹一整天也能原諒你。");
        state.characters.aoi.affection += 4;
        state.characters.aoi.sync += 3;
      }

      if (!hasEnaChikuwa) {
        beats.push("惠那看著大家的照片，笑著說這次少了竹輪專用鏡頭。她沒有真的介意，但你感覺下次可以準備得更貼心。");
        state.characters.ena.affection += 1;
      } else {
        beats.push("你把竹輪也會用到的保暖用品和拍照準備放進計畫。惠那看著照片笑了笑，說你比想像中細心。");
        state.characters.ena.affection += 4;
        state.characters.ena.trust += 2;
      }

      const rank = percent >= 1 ? "完美準備" : percent >= .75 ? "高品質體驗" : percent >= .4 ? "順利露營" : "勉強成行";
      state.campResult = { beats, completed, total, percent, score, rank, main };
      return state.campResult;
    }


    function isCheckDone(id) {
      return state.checklist.some((c) => c.id === id && c.status === "done");
    }


    function highestTendency() {
      return ["rin", "nadeshiko", "chiaki", "aoi", "ena"]
        .map((id) => ({ id, value: state.characters[id].tendency }))
        .sort((a, b) => b.value - a.value)[0].id;
    }


    function isCampingScene() {
      return state.day >= 5 || state.mode === "camp" || state.mode === "diary";
    }
