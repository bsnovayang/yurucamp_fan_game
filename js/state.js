var state;
var days = window.GameData.days;
var daySubtitles = window.GameData.daySubtitles;
var characters = window.GameData.characters;
var items = window.GameData.items;
var events = window.GameData.events;
var week2Routes = window.GameData.week2Routes;
var combos = window.GameData.combos;
var SAVE_VERSION = 3;


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
        finished: false,
        saveVersion: SAVE_VERSION
      };
      delete state.characters.player.affection;
      render();
    }


    function totalLoad() {
      return state.bag.reduce((sum, it) => sum + it.weight, 0);
    }


    function canonicalItem(id) {
      return items.find((it) => it.id === id);
    }


    function itemType(it) {
      return it.type || (canonicalItem(it.id) || {}).type || "gear";
    }


    function typeLabel(type) {
      if (type === "consumable") return "消耗品";
      if (type === "ticket") return "票券";
      return "裝備";
    }


    function resaleValue(it) {
      return Math.floor((it.price || 0) * 0.5);
    }


    function consumeCampItems() {
      const consumed = [];
      state.bag = state.bag.filter((it) => {
        const shouldConsume = ["consumable", "ticket"].includes(itemType(it));
        if (shouldConsume) consumed.push(it);
        return !shouldConsume;
      });
      if (consumed.length) {
        state.log.unshift(`露營結束後消耗：${consumed.map((it) => it.name).join("、")}。`);
      } else {
        state.log.unshift("露營結束後沒有消耗品需要清理，裝備留在背包。");
      }
      return consumed;
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
      const triggeredCombos = activeCombos();
      triggeredCombos.forEach((entry) => applyEffects(entry.combo.effects));
      const score = Math.round(
        state.stats.warmth + state.stats.scenery + state.stats.cooking + state.stats.bond + state.stats.chill +
        state.stamina + completed * 10 + triggeredCombos.length * 8
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

      triggeredCombos.forEach((entry) => {
        beats.push(comboStoryText(entry.combo.id, "week1", main));
      });

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


    function routeScore(id) {
      const char = state.characters[id];
      return char.affection + char.trust + char.sync + char.tendency;
    }


    function routeCandidates() {
      return ["rin", "nadeshiko", "chiaki", "aoi", "ena"]
        .map((id) => ({ id, value: routeScore(id) }))
        .sort((a, b) => b.value - a.value);
    }


    function isCampingScene() {
      return state.day >= 5 || state.mode === "camp" || state.mode === "diary" || state.mode === "week2Camp";
    }


    function bagTags(extraItem) {
      const source = extraItem ? state.bag.concat(extraItem) : state.bag;
      return [...new Set(source.flatMap((it) => it.tags))];
    }


    function comboProgress(combo, extraItem) {
      const tags = bagTags(extraItem);
      const owned = combo.tags.filter((tag) => tags.includes(tag));
      const missing = combo.tags.filter((tag) => !tags.includes(tag));
      return {
        combo,
        owned,
        missing,
        active: missing.length === 0,
        percent: combo.tags.length ? owned.length / combo.tags.length : 0
      };
    }


    function comboStates(extraItem) {
      return combos.map((combo) => comboProgress(combo, extraItem));
    }


    function activeCombos(extraItem) {
      return comboStates(extraItem).filter((entry) => entry.active);
    }


    function relevantCombos(extraItem) {
      return comboStates(extraItem)
        .filter((entry) => entry.active || entry.owned.length > 0)
        .sort((a, b) => Number(b.active) - Number(a.active) || b.owned.length - a.owned.length || a.missing.length - b.missing.length);
    }


    function comboStoryText(id, week, routeId) {
      const prefix = week === "week2" ? "Build 觸發" : "露營 Build";
      const comboName = (combos.find((combo) => combo.id === id) || {}).name || "未知 Build";
      const texts = {
        winter_comfort: `保暖用品和熱飲剛好接上湖邊的低溫。凜看見你沒有只準備一件東西，而是把夜晚坐下來的舒適感一起考慮進去。`,
        camp_dinner: `熱料理和主食湊成了真正的露營晚餐。撫子一看到鍋裡冒出的熱氣，整個人都像被重新充飽電。`,
        yakatsu_diy: `省錢材料加上改造思路，讓千明立刻進入社長模式。她把成果稱為野活精神的具體展現。`,
        quiet_lake: `安靜用品和風景準備讓營地節奏慢了下來。凜沒有說太多，但她主動多看了一會兒你選的位置。`,
        onsen_finish: `溫泉和熱飲把露營收尾變得很完整。葵笑著說，懂得休息的人才懂冬天露營。`,
        chikuwa_care: `寵物用品和保暖準備讓竹輪也有自己的位置。惠那看著牠安心窩下來，語氣比平常更柔和。`,
        memory_photo: `拍照和風景準備留下了自然的瞬間。惠那翻著照片，說這種沒有刻意擺姿勢的畫面最像回憶。`,
        group_hotpot: `團體用品和熱料理讓晚餐變成大家一起完成的事件。千明負責指揮，撫子負責期待，氣氛很快熱了起來。`,
        healing_break: `療癒用品和熱飲讓大家多留了一點慢下來的時間。葵說這種空白不是浪費，是露營必要的部分。`
      };
      return `${prefix}「${comboName}」：${texts[id] || `${routeId ? state.characters[routeId].name : "大家"}注意到這次準備形成了新的露營節奏。`}`;
    }
