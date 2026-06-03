
    function openShop() {
      state.mode = "shop";
      state.shop = buildShop();
      render();
    }


    function buildShop() {
      const guaranteed = [];
      const neededTags = state.checklist
        .filter((c) => c.status !== "done")
        .flatMap((c) => c.requiredTags);
      const uniqueNeeded = [...new Set(neededTags)];

      uniqueNeeded.forEach((tag) => {
        const candidates = items.filter((it) => it.tags.includes(tag) && !guaranteed.some((g) => g.id === it.id));
        if (candidates.length) guaranteed.push(sample(candidates));
      });

      if (state.week === 2 && state.week2Main) {
        const routeTags = week2Routes[state.week2Main].preferredTags || [];
        routeTags.forEach((tag) => {
          if (guaranteed.length >= 8) return;
          const candidates = items.filter((it) => it.tags.includes(tag) && !guaranteed.some((g) => g.id === it.id));
          if (candidates.length) guaranteed.push(sample(candidates));
        });
      }

      const requiredFallback = ["保暖", "熱飲", "熱料理", "省錢"];
      requiredFallback.forEach((tag) => {
        if (guaranteed.length >= 8) return;
        if (!guaranteed.some((it) => it.tags.includes(tag))) {
          const candidates = items.filter((it) => it.tags.includes(tag) && !guaranteed.some((g) => g.id === it.id));
          if (candidates.length) guaranteed.push(sample(candidates));
        }
      });

      const rest = items.filter((it) => !guaranteed.some((g) => g.id === it.id));
      while (guaranteed.length < 8 && rest.length) {
        const picked = sample(rest);
        guaranteed.push(picked);
        rest.splice(rest.findIndex((it) => it.id === picked.id), 1);
      }
      return guaranteed;
    }


    function sample(list) {
      return list[Math.floor(Math.random() * list.length)];
    }


    function matchingChecks(it) {
      return state.checklist.filter((c) =>
        c.status !== "done" && c.requiredTags.some((tag) => it.tags.includes(tag))
      );
    }


    function buyItem(id) {
      const it = state.shop.find((entry) => entry.id === id);
      if (!it) return;
      if (state.budget < it.price) {
        state.log.unshift(`預算不足，買不起「${it.name}」。`);
        render();
        return;
      }
      if (totalLoad() + it.weight > state.loadMax) {
        state.log.unshift(`背包容量不足，放不下「${it.name}」。目前負重 ${totalLoad()} / ${state.loadMax}，該物品負重 ${it.weight}。`);
        render();
        return;
      }
      state.budget -= it.price;
      state.bag.push(it);
      applyItemEffects(it);
      state.log.unshift(`買下「${it.name}」，放進背包。`);
      updateChecklistStatus(true);
      render();
    }


    function sellItem(index) {
      if (isCampingScene()) {
        state.log.unshift("露營當天不能整理出售背包，等回到平日再處理。");
        render();
        return;
      }
      const it = state.bag[index];
      if (!it) return;
      const refund = resaleValue(it);
      state.bag.splice(index, 1);
      state.budget += refund;
      updateChecklistStatus(true);
      state.log.unshift(`賣出「${it.name}」，回收 ${refund} 圓，背包負重下降。`);
      render();
    }


    function applyItemEffects(it) {
      Object.keys(it.effects || {}).forEach((key) => {
        if (key in state.stats) state.stats[key] += it.effects[key];
        else if (key === "trust") {
          state.characters.chiaki.trust += 1;
          state.characters.rin.trust += 1;
        }
      });
      it.tags.forEach((tag) => {
        if (["熱料理", "主食"].includes(tag)) state.characters.nadeshiko.tendency += 2;
        if (["保暖", "熱飲", "安靜"].includes(tag)) state.characters.rin.tendency += 2;
        if (["省錢", "改造"].includes(tag)) state.characters.chiaki.tendency += 3;
        if (["溫泉", "療癒", "熱飲"].includes(tag)) state.characters.aoi.tendency += 2;
        if (["寵物", "拍照"].includes(tag)) state.characters.ena.tendency += 3;
      });
    }
