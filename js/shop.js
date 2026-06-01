
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
        state.log.unshift(`背包太重，放不下「${it.name}」。`);
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
