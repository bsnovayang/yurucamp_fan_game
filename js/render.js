
    function avatarSrc(id) {
      const char = state.characters[id];
      if (!char || !char.img) return "";
      return isCampingScene() ? char.campImg : char.img;
    }


    function avatarHtml(id, className = "") {
      const src = avatarSrc(id);
      const char = state.characters[id];
      if (!src) return "";
      return `<img class="${className}" src="${src}" alt="${char.name}">`;
    }


    function lineAvatarSrc(id) {
      const char = state.characters[id];
      if (!char || !char.img) return "";
      const suffix = isCampingScene() ? "_camp_line.png" : "_line.png";
      return `img/line/${id}${suffix}`;
    }


    function renderLineMessage(message) {
      const char = state.characters[message.speaker];
      const src = lineAvatarSrc(message.speaker);
      return `
        <div class="message">
          <img class="line-avatar" src="${src}" alt="${char.name}">
          <div class="bubble">
            <span class="bubble-name">${char.name}</span>
            ${message.text}
          </div>
        </div>
      `;
    }


    function render() {
      renderHeader();
      renderWeek();
      renderMain();
      renderChecklist();
      renderInventory();
      renderMeters();
      renderLog();
    }


    function renderHeader() {
      const prefix = state.week === 2 ? "第二週" : days[state.day];
      const subtitle = state.week === 2
        ? (state.mode === "week2Camp" ? "週末露營" : `準備 ${Math.min(state.week2ActionsUsed + 1, state.week2ActionMax)} / ${state.week2ActionMax}`)
        : daySubtitles[state.day];
      document.getElementById("phaseTitle").textContent = `${prefix}：${subtitle}`;
      document.getElementById("moneyTag").textContent = `預算 ${state.budget}`;
    }


    function renderWeek() {
      if (state.week === 2) {
        const routeName = state.week2Main ? state.characters[state.week2Main].name : "路線";
        document.getElementById("week").innerHTML = [
          ["導入", "LINE 提示"],
          ["準備 1", "平日行動"],
          ["準備 2", "平日行動"],
          ["準備 3", "平日行動"],
          ["露營", `${routeName} 回饋`]
        ].map((entry, index) => {
          const activeIndex = state.mode === "week2" ? 0 :
            state.mode === "week2Camp" ? 4 :
            Math.min(state.week2ActionsUsed + 1, 3);
          return `
            <div class="day ${index === activeIndex ? "active" : ""}">
              <b>${entry[0]}</b><br>${entry[1]}
            </div>
          `;
        }).join("");
        return;
      }
      document.getElementById("week").innerHTML = days.map((day, index) => `
        <div class="day ${index === state.day ? "active" : ""}">
          <b>${day}</b><br>${daySubtitles[index]}
        </div>
      `).join("");
    }


    function renderMain() {
      if (state.mode === "shop") return renderShop();
      if (state.mode === "actions") return renderActions();
      if (state.mode === "camp") return renderCamp();
      if (state.mode === "diary") return renderDiary();
      if (state.mode === "week2") return renderWeek2Intro();
      if (state.mode === "week2End") return renderWeek2End();
      if (state.mode === "week2Camp") return renderWeek2Camp();

      const ev = events[state.day];
      const char = state.characters[ev.speaker];
      document.getElementById("sceneLabel").textContent = ev.scene;
      document.getElementById("eventTitle").textContent = ev.title;
      document.getElementById("speakerAvatar").innerHTML = avatarHtml(ev.speaker) || char.avatar;
      document.getElementById("speakerAvatar").style.background = char.color;
      document.getElementById("speakerName").textContent = ev.format === "line" ? ev.chatTitle : char.name;
      const dialogue = document.querySelector(".dialogue");
      if (ev.format === "line") {
        dialogue.classList.add("phone-chat");
        document.getElementById("dialogueText").innerHTML = `
          <div class="phone-head">
            <span>${ev.chatTitle}</span>
            <span>${days[state.day]} 20:4${state.day}</span>
          </div>
          <div class="messages">
            ${ev.messages.map(renderLineMessage).join("")}
          </div>
        `;
      } else {
        dialogue.classList.remove("phone-chat");
        document.getElementById("dialogueText").textContent = ev.text;
      }
      document.getElementById("mainAction").innerHTML = `
        <div class="choices">
          ${ev.choices.map((c, index) => `
            <button class="choice" onclick="pickChoice(${index})">
              <b>${c.label}</b>
              <span>${c.desc}</span>
            </button>
          `).join("")}
        </div>
      `;
    }


    function renderActions() {
      document.querySelector(".dialogue").classList.remove("phone-chat");
      const isWeek2 = state.week === 2;
      document.getElementById("sceneLabel").textContent = isWeek2
        ? "第二週的準備更有路線感。你只有 3 次行動，準備方向會直接影響這次角色露營事件的品質。"
        : "平日晚上只有一點時間。你可以把角色訊息變成準備，也可以打工補預算，或先休息避免週末體力不足。";
      document.getElementById("eventTitle").textContent = isWeek2
        ? `第二週準備行動 ${state.week2ActionsUsed + 1} / ${state.week2ActionMax}`
        : `${days[state.day]} 晚上的自由時間`;
      document.getElementById("speakerAvatar").innerHTML = "行";
      document.getElementById("speakerAvatar").style.background = "#2f8b7d";
      document.getElementById("speakerName").textContent = "平日行動";
      document.getElementById("dialogueText").textContent = state.actionPrompt || "選擇今天晚上的行動。";
      document.getElementById("mainAction").innerHTML = `
        <div class="action-grid">
          <button class="action-card" onclick="doWeekdayAction('shop')">
            <b>採買</b>
            <span>打開商店。符合 checklist 的商品會有黃色標記，買到後會打勾。</span>
          </button>
          <button class="action-card" onclick="doWeekdayAction('work')">
            <b>打工</b>
            <span>預算 +1500，體力 -15。適合想買高價裝備或食材時使用。</span>
          </button>
          <button class="action-card" onclick="doWeekdayAction('research')">
            <b>查營地資料</b>
            <span>體力 -5，風景體驗 +3，凜信任 +1。更了解天氣與路線。</span>
          </button>
          <button class="action-card" onclick="doWeekdayAction('notes')">
            <b>整理露營筆記</b>
            <span>重新確認未完成的角色期待，讓相關角色傾向小幅上升。</span>
          </button>
          <button class="action-card" onclick="doWeekdayAction('rest')">
            <b>休息</b>
            <span>體力 +20，療癒 +2。週末前保留體力也很重要。</span>
          </button>
          <button class="action-card" onclick="doWeekdayAction('skip')">
            <b>${isWeek2 ? "消耗行動" : "直接隔天"}</b>
            <span>不進行額外行動。保留目前狀態${isWeek2 ? "，消耗一次準備機會。" : "進入下一天。"}</span>
          </button>
        </div>
      `;
    }


    function renderShop() {
      document.querySelector(".dialogue").classList.remove("phone-chat");
      document.getElementById("sceneLabel").textContent = "商店會優先出現 checklist 相關分類，但具體商品仍有隨機差異。黃色角標代表這件商品能完成某位角色提到的期待。";
      document.getElementById("eventTitle").textContent = "採買與打包";
      document.getElementById("speakerAvatar").innerHTML = "店";
      document.getElementById("speakerAvatar").style.background = "#2f8b7d";
      document.getElementById("speakerName").textContent = "戶外用品店";
      document.getElementById("dialogueText").textContent = "挑選下次露營要帶的東西。買到符合分類的物品後，右側 checklist 會即時打勾。完成採買後，今晚行動結束並進入下一天。";
      document.getElementById("mainAction").innerHTML = `
        <div class="shop-grid">
          ${state.shop.map((it) => renderShopItem(it)).join("")}
        </div>
        <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn primary" onclick="finishShopping()">完成採買</button>
          <button class="btn" onclick="openShop()">換一批商品</button>
        </div>
      `;
    }


    function renderShopItem(it) {
      const matches = matchingChecks(it);
      const canBuy = state.budget >= it.price && totalLoad() + it.weight <= state.loadMax;
      const tooltip = matches.length
        ? matches.map((c) => `${state.characters[c.sourceCharacter].name}：「${c.sourceText}」`).join("\n")
        : "目前沒有直接對應 checklist，但仍可能提高體驗。";
      return `
        <div class="item-card ${matches.length ? "match" : ""}" title="${escapeAttr(tooltip)}">
          ${matches.length ? `<div class="corner">可完成 ${matches.length}</div>` : ""}
          <h3>${it.name}</h3>
          <p>${it.desc}</p>
          <div class="tags">${it.tags.map((tag) => `<span class="mini-tag">${tag}</span>`).join("")}</div>
          <div class="item-meta"><span>${it.price} 圓</span><span>重量 ${it.weight}</span></div>
          <button class="btn primary" onclick="buyItem('${it.id}')" ${canBuy ? "" : "disabled"}>${canBuy ? "購買" : "買不起 / 太重"}</button>
        </div>
      `;
    }


    function renderCamp() {
      document.querySelector(".dialogue").classList.remove("phone-chat");
      const result = campResults();
      document.getElementById("sceneLabel").textContent = "湖畔的夜晚比想像中更冷。你這週記下來的每一句話，都會在這裡變成角色的反應。";
      document.getElementById("eventTitle").textContent = `週六湖畔露營：${result.rank}`;
      document.getElementById("speakerAvatar").innerHTML = avatarHtml(result.main) || "營";
      document.getElementById("speakerAvatar").style.background = state.characters[result.main].color;
      document.getElementById("speakerName").textContent = `露營當天：${state.characters[result.main].name}`;
      document.getElementById("dialogueText").textContent = result.beats.join("\n\n");
      document.getElementById("mainAction").innerHTML = `
        <div class="summary">
          <div class="summary-card"><b>完成目標</b><span>${result.completed}/${result.total}</span></div>
          <div class="summary-card"><b>體驗分</b><span>${result.score}</span></div>
          <div class="summary-card"><b>主要互動</b><span>${state.characters[result.main].avatar}</span></div>
          <div class="summary-card"><b>評價</b><span>${result.rank}</span></div>
        </div>
        <div style="margin-top:14px;">
          <button class="btn primary" onclick="goToDiary()">寫露營日記</button>
        </div>
      `;
    }


    function renderDiary() {
      document.querySelector(".dialogue").classList.remove("phone-chat");
      const result = campResults();
      document.getElementById("sceneLabel").textContent = "週日早上，湖面很安靜。你把這週學到的事情寫進露營日記。";
      document.getElementById("eventTitle").textContent = "第一週結算";
      document.getElementById("speakerAvatar").innerHTML = avatarHtml(result.main) || "記";
      document.getElementById("speakerAvatar").style.background = state.characters[result.main].color;
      document.getElementById("speakerName").textContent = "露營日記";
      document.getElementById("dialogueText").textContent =
        `這週完成了 ${result.completed} / ${result.total} 個角色期待。\n` +
        `下週優先出現的事件傾向是：${state.characters[result.main].name}。\n\n` +
        nextHint(result.main) +
        "\n\n目前 prototype 到第一週結算為止。下一版會接續這個結果，進入第二週的角色事件。";
      document.getElementById("mainAction").innerHTML = `
        <div class="summary">
          <div class="summary-card"><b>凜 好感</b><span>${state.characters.rin.affection}</span></div>
          <div class="summary-card"><b>撫子 好感</b><span>${state.characters.nadeshiko.affection}</span></div>
          <div class="summary-card"><b>千明 好感</b><span>${state.characters.chiaki.affection}</span></div>
          <div class="summary-card"><b>葵 好感</b><span>${state.characters.aoi.affection}</span></div>
          <div class="summary-card"><b>惠那 好感</b><span>${state.characters.ena.affection}</span></div>
          <div class="summary-card"><b>體驗分</b><span>${result.score}</span></div>
        </div>
        <div class="diary-card">
          <b>第一週回憶卡</b>
          主要互動：${state.characters[result.main].name}<br>
          完成目標：${result.completed} / ${result.total}<br>
          角色一句話：${firstWeekLine(result.main, result.rank)}
        </div>
        <div class="end-note">
          <b>第一週測試版到此結束</b>
          這一版主要驗證「角色對話產生 checklist → 採買打勾 → 露營劇情回饋」是否有趣。下週內容尚未實作，現在可以重新測一次，試試不同選項與採買路線。
        </div>
        <div style="margin-top:14px;">
          <button class="btn primary" onclick="startWeek2()">進入第二週導入</button>
          <button class="btn primary" onclick="newGame()">再測一次</button>
        </div>
      `;
    }


    function renderWeek2Intro() {
      const routeId = state.week2Main || campResults().main;
      const route = week2Routes[routeId];
      const char = state.characters[routeId];
      document.getElementById("sceneLabel").textContent = route.scene;
      document.getElementById("eventTitle").textContent = route.title;
      document.getElementById("speakerAvatar").innerHTML = avatarHtml(routeId) || char.avatar;
      document.getElementById("speakerAvatar").style.background = char.color;
      document.getElementById("speakerName").textContent = route.chatTitle;
      document.querySelector(".dialogue").classList.add("phone-chat");
      document.getElementById("dialogueText").innerHTML = `
        <div class="phone-head">
          <span>${route.chatTitle}</span>
          <span>第二週 19:58</span>
        </div>
        <div class="messages">
          ${route.messages.map(renderLineMessage).join("")}
        </div>
      `;
      document.getElementById("mainAction").innerHTML = `
        <div class="choices">
          ${route.replies.map((reply, index) => `
            <button class="choice" onclick="acceptWeek2Reply(${index})">
              <b>${reply.label}</b>
              <span>${reply.text}<br>${route.note}</span>
            </button>
          `).join("")}
          <button class="choice" onclick="newGame()">
            <b>回到第一週重測</b>
            <span>第二週完整流程還沒實作，可以先回頭測不同路線傾向。</span>
          </button>
        </div>
      `;
    }


    function renderWeek2End() {
      const routeId = state.week2Main || campResults().main;
      const route = week2Routes[routeId];
      const char = state.characters[routeId];
      document.querySelector(".dialogue").classList.remove("phone-chat");
      document.getElementById("sceneLabel").textContent = "第二週目前先做到路線導入。這裡用來測試第一週結算是否能自然接到不同角色方向。";
      document.getElementById("eventTitle").textContent = "第二週導入完成";
      document.getElementById("speakerAvatar").innerHTML = avatarHtml(routeId) || char.avatar;
      document.getElementById("speakerAvatar").style.background = char.color;
      document.getElementById("speakerName").textContent = char.name;
      document.getElementById("dialogueText").textContent =
        `${route.note}\n\n右側 checklist 已加入第二週目標。下一階段可以把這些目標接成完整第二週流程：平日行動、採買、週末露營與新的結算。`;
      document.getElementById("mainAction").innerHTML = `
        <div class="summary">
          <div class="summary-card"><b>路線傾向</b><span>${char.avatar}</span></div>
          <div class="summary-card"><b>新目標</b><span>${route.checks.length}</span></div>
          <div class="summary-card"><b>預算</b><span>${state.budget}</span></div>
          <div class="summary-card"><b>體力</b><span>${state.stamina}</span></div>
        </div>
        <div class="end-note">
          <b>第二週測試版到此結束</b>
          這一版主要驗證「第一週結果 → 角色路線導入 → 新 checklist」是否自然。
        </div>
        <div style="margin-top:14px;">
          <button class="btn primary" onclick="newGame()">再測一次</button>
        </div>
      `;
    }


    function week2CampResults() {
      if (state.week2CampResult) return state.week2CampResult;
      const routeId = state.week2Main || campResults().main;
      const route = week2Routes[routeId];
      const routeChecks = route.checks.map((c) => c.id);
      const completed = state.checklist.filter((c) => routeChecks.includes(c.id) && c.status === "done").length;
      const total = routeChecks.length;
      const quality = completed >= total ? "perfect" : completed > 0 ? "good" : "miss";
      const char = state.characters[routeId];
      const score = 80 + completed * 28 + state.stats.chill + state.stats.cooking + state.stats.scenery;
      const beats = [];
      const chosen = route.campChoices[state.week2CampChoice ?? 0];
      if (chosen) {
        applyEffects(chosen.effects);
      }

      if (routeId === "rin") {
        if (quality === "perfect") {
          beats.push("你把安靜露營用品和防風熱飲都準備好了。湖邊風很冷，但兩個人坐下來時，凜沒有急著拿出書，而是先說：「這裡，還不錯吧。」");
          char.affection += 5; char.trust += 3; char.sync += 4;
        } else if (quality === "good") {
          beats.push("準備不是完美，但至少抓住了凜最在意的方向。她把熱飲杯捧在手裡，安靜地看了一會兒湖面。你沒有催她說話。");
          char.affection += 3; char.sync += 2;
        } else {
          beats.push("這次準備有點跟不上湖邊的冷風。凜借了你一點備品，語氣很平淡：『下次先看風向。』");
          char.trust += 1;
        }
      }

      if (chosen) {
        beats.push(chosen.result);
      }

      if (routeId === "nadeshiko") {
        if (quality === "perfect") {
          beats.push("早餐主食、甜點和熱飲都準備好了。撫子一邊吃一邊發出幸福到快融化的聲音，最後很認真地替這次早餐命名。");
          char.affection += 5; char.trust += 3; char.sync += 3;
        } else if (quality === "good") {
          beats.push("雖然少了一點配料，但熱呼呼的早餐還是成功了。撫子笑著說，只要在露營地吃，好吃度會自動加倍。");
          char.affection += 3; char.trust += 1;
        } else {
          beats.push("早餐挑戰變成了泡麵補救會。撫子倒是很開心，說泡麵也是很棒的露營早餐，但你感覺下次可以讓她更驚喜。");
          char.affection += 1;
        }
      }

      if (routeId === "chiaki") {
        if (quality === "perfect") {
          beats.push("改造材料和團體用品都準備齊了。千明把簡易風防組起來時，像宣布重大發明一樣抬頭挺胸。她甚至要求大家鼓掌三秒。");
          char.affection += 4; char.trust += 4; char.sync += 3;
        } else if (quality === "good") {
          beats.push("改造計畫只完成一半，但千明很擅長把半成品變成活動。大家邊修邊笑，反而很有野活味。");
          char.affection += 3; char.trust += 2;
        } else {
          beats.push("第二彈改造企劃幾乎變成口頭發表。千明雖然吐槽準備不足，還是立刻開始畫第三彈草圖，彷彿失敗只是企劃的一部分。");
          char.affection += 1;
        }
      }

      if (routeId === "aoi") {
        if (quality === "perfect") {
          beats.push("熱茶和溫泉收尾都安排好了。葵笑著說你很懂得把露營玩到最後一分鐘，也懂得什麼時候該放鬆。");
          char.affection += 4; char.trust += 3; char.sync += 4;
        } else if (quality === "good") {
          beats.push("雖然沒有做到完美收尾，但你至少記得讓大家暖起來。葵捧著杯子，笑著說這樣就很像冬天露營了。");
          char.affection += 3; char.sync += 2;
        } else {
          beats.push("收尾有點匆忙。葵笑著說下次她會提醒你，然後補上一句：不是想偷懶喔。");
          char.affection += 1;
        }
      }

      if (routeId === "ena") {
        if (quality === "perfect") {
          beats.push("竹輪用品和拍照準備都很完整。惠那翻著照片，說你抓到的瞬間比擺拍更像大家。");
          char.affection += 4; char.trust += 3; char.sync += 3;
        } else if (quality === "good") {
          beats.push("準備雖然少了一點，但竹輪看起來很舒服。惠那看著牠鑽進毯子的樣子，露出很放鬆的笑。");
          char.affection += 3; char.trust += 1;
        } else {
          beats.push("這次差點忘了竹輪的份。惠那沒有責怪你，只是把竹輪抱起來說，下次要一起記得喔。");
          char.affection += 1;
        }
      }

      state.week2CampResult = {
        routeId,
        completed,
        total,
        quality,
        score,
        rank: quality === "perfect" ? "路線事件大成功" : quality === "good" ? "路線事件成功" : "路線事件補救版",
        beats
      };
      return state.week2CampResult;
    }


    function renderWeek2Camp() {
      document.querySelector(".dialogue").classList.remove("phone-chat");
      if (state.week2CampChoice === null) return renderWeek2CampChoice();
      const result = week2CampResults();
      const char = state.characters[result.routeId];
      document.getElementById("sceneLabel").textContent = "第二週週末，第一週累積的角色傾向正式變成不同露營事件。這次只做短結算，用來測路線回饋感。";
      document.getElementById("eventTitle").textContent = `第二週露營：${result.rank}`;
      document.getElementById("speakerAvatar").innerHTML = avatarHtml(result.routeId) || char.avatar;
      document.getElementById("speakerAvatar").style.background = char.color;
      document.getElementById("speakerName").textContent = `${char.name} 路線事件`;
      document.getElementById("dialogueText").textContent = result.beats.join("\n\n");
      document.getElementById("mainAction").innerHTML = `
        <div class="summary">
          <div class="summary-card"><b>第二週目標</b><span>${result.completed}/${result.total}</span></div>
          <div class="summary-card"><b>路線角色</b><span>${char.avatar}</span></div>
          <div class="summary-card"><b>體驗分</b><span>${Math.round(result.score)}</span></div>
          <div class="summary-card"><b>評價</b><span>${result.completed >= result.total ? "★" : result.completed ? "○" : "△"}</span></div>
        </div>
        <div class="diary-card">
          <b>第二週回憶卡</b>
          路線角色：${char.name}<br>
          LINE 回覆：${week2Routes[result.routeId].replies[state.week2Reply ?? 0].label}<br>
          露營選擇：${week2Routes[result.routeId].campChoices[state.week2CampChoice ?? 0].label}<br>
          角色一句話：${week2FinalLine(result.routeId, result.quality)}
        </div>
        <div class="end-note">
          <b>第二週短流程到此結束</b>
          下一階段可以把這個短結算擴成完整第二週：更多 LINE 互動、角色專屬採買、料理或搭營小遊戲。
        </div>
        <div style="margin-top:14px;">
          <button class="btn primary" onclick="newGame()">再測一次</button>
        </div>
      `;
    }


    function week2FinalLine(id, quality) {
      if (id === "rin") return quality === "perfect" ? "「這種距離，剛剛好。」" : quality === "good" ? "「下次可以再來。」" : "「備品要自己帶。」";
      if (id === "nadeshiko") return quality === "perfect" ? "「早餐露營，大成功！」" : quality === "good" ? "「熱熱的就很好吃！」" : "「下次我也一起準備！」";
      if (id === "aoi") return quality === "perfect" ? "「這個收尾，很可以喔。」" : quality === "good" ? "「有熱茶就及格啦。」" : "「下次泡湯也排進去吧。」";
      if (id === "ena") return quality === "perfect" ? "「竹輪說你可以加入牠的小隊。」" : quality === "good" ? "「這張照片不錯喔。」" : "「下次也記得竹輪。」";
      return quality === "perfect" ? "「第二彈，正式成功！」" : quality === "good" ? "「半成品也是野活精神！」" : "「第三彈一定會成功！」";
    }


    function renderWeek2CampChoice() {
      const routeId = state.week2Main || campResults().main;
      const route = week2Routes[routeId];
      const char = state.characters[routeId];
      document.getElementById("sceneLabel").textContent = "第二週週末到了。這次不是直接結算，你可以選擇露營當天怎麼回應角色。";
      document.getElementById("eventTitle").textContent = `${char.name} 的露營當天事件`;
      document.getElementById("speakerAvatar").innerHTML = avatarHtml(routeId) || char.avatar;
      document.getElementById("speakerAvatar").style.background = char.color;
      document.getElementById("speakerName").textContent = char.name;
      document.getElementById("dialogueText").textContent = "準備已經完成，接下來是現場的選擇。不同選項會影響好感、信任、節奏或體驗指數。";
      document.getElementById("mainAction").innerHTML = `
        <div class="choices">
          ${route.campChoices.map((choiceDef, index) => `
            <button class="choice" onclick="chooseWeek2Camp(${index})">
              <b>${choiceDef.label}</b>
              <span>${choiceDef.result}</span>
            </button>
          `).join("")}
        </div>
      `;
    }


    function nextHint(id) {
      if (id === "rin") return "凜似乎願意分享更多安靜營地的情報。下次也許可以準備更適合單人露營的東西。";
      if (id === "nadeshiko") return "撫子已經開始想下一次菜單。下次可能會出現更完整的料理準備。";
      if (id === "aoi") return "葵對露營後的放鬆安排很滿意。下次也許會出現溫泉、熱茶與輕聲真心話的事件。";
      if (id === "ena") return "惠那記得你替竹輪準備的細節。下次也許會出現寵物友善營地與拍照事件。";
      return "千明對省錢企劃很滿意。下次也許能試試更誇張的野活改造方案。";
    }


    function firstWeekLine(id, rank) {
      if (id === "rin") return rank === "完美準備" ? "「下次也可以考慮那個營地。」" : "「下次先看風向會比較好。」";
      if (id === "nadeshiko") return rank === "完美準備" ? "「下次也一起吃好吃的吧！」" : "「泡麵也很好吃，但下次想吃鍋！」";
      if (id === "aoi") return rank === "完美準備" ? "「泡完湯再喝茶，這才是冬露收尾啊。」" : "「下次記得留一點放鬆時間喔。」";
      if (id === "ena") return rank === "完美準備" ? "「竹輪說你很有前途。大概。」" : "「下次幫竹輪也拍一張吧。」";
      return rank === "完美準備" ? "「這就是野活的勝利！」" : "「下次預算表要先寫！」";
    }


    function renderChecklist() {
      const box = document.getElementById("checklist");
      document.getElementById("checkProgress").textContent = `${doneChecks()} / ${state.checklist.length}`;
      if (!state.checklist.length) {
        box.innerHTML = `<p class="empty">還沒有角色期待。看劇情、回應角色後，這裡會記錄下次露營要準備的事。</p>`;
        return;
      }
      box.innerHTML = state.checklist.map((c) => {
        const char = state.characters[c.sourceCharacter];
        const icon = c.status === "done" ? "✓" : "!";
        const title = `${char.name}：「${c.sourceText}」\n需要分類：${c.requiredTags.join(" / ")}`;
        return `
          <div class="check ${c.status}" title="${escapeAttr(title)}">
            <div class="status">${c.status === "done" && isCampingScene() ? avatarHtml(c.sourceCharacter) : icon}</div>
            <div>
              <b>${c.label}</b>
              <span>${char.name} 的提示：${c.sourceText}</span>
              <div class="tags" style="margin:7px 0 0;">${c.requiredTags.map((tag) => `<span class="mini-tag">${tag}</span>`).join("")}</div>
            </div>
          </div>
        `;
      }).join("");
    }


    function renderInventory() {
      document.getElementById("loadTag").textContent = `${totalLoad()} / ${state.loadMax}`;
      const box = document.getElementById("inventory");
      if (!state.bag.length) {
        box.innerHTML = `<p class="empty">背包還是空的。採買時先看黃色標記，它們通常能回應角色剛剛說過的事。</p>`;
        return;
      }
      box.innerHTML = state.bag.map((it) => `
        <div class="bag-item">
          <div>
            <b>${it.name}</b>
            <small>${it.tags.join(" / ")}</small>
          </div>
          <span>${it.weight}</span>
        </div>
      `).join("");
    }


    function renderMeters() {
      const box = document.getElementById("meters");
      const rows = ["rin", "nadeshiko", "chiaki", "aoi", "ena"].map((id) => {
        const char = state.characters[id];
        const value = Math.max(0, Math.min(100, char.affection + char.trust + char.sync + char.tendency));
        return `
          <div class="meter-row">
            ${avatarHtml(id, "mini-avatar")}
            <span>${char.name.slice(-2)}</span>
            <div class="meter"><span style="width:${value}%; background:${char.color}"></span></div>
            <b>${value}</b>
            <div></div>
            <div class="stat-detail" style="grid-column: 2 / 5;">
              <span>好 ${char.affection}</span>
              <span>信 ${char.trust}</span>
              <span>節 ${char.sync}</span>
              <span>傾 ${char.tendency}</span>
            </div>
          </div>
        `;
      }).join("");
      const resources = `
        <div class="meter-row">
          <span></span>
          <span>體力</span>
          <div class="meter"><span style="width:${state.stamina}%; background:#6c8b4f"></span></div>
          <b>${state.stamina}</b>
        </div>
      `;
      box.innerHTML = rows + resources;
    }


    function renderLog() {
      const box = document.getElementById("log");
      box.innerHTML = state.log.slice(0, 8).map((line) => `<li>${line}</li>`).join("");
    }


    function escapeAttr(text) {
      return String(text).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
    }
