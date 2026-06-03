
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
      renderBuilds();
      renderRouteProgress();
      renderMeters();
      renderLog();
    }


    function renderHeader() {
      const prefix = state.week === 2 ? "第二週" : days[state.day];
      const subtitle = state.week === 2
        ? (state.mode === "week2Diary" ? "露營日記" : state.mode === "week2Camp" ? "週末露營" : `準備 ${Math.min(state.week2ActionsUsed + 1, state.week2ActionMax)} / ${state.week2ActionMax}`)
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
          ["露營", `${routeName} 回饋`],
          ["日記", "路線判定"]
        ].map((entry, index) => {
          const activeIndex = state.mode === "week2" ? 0 :
            state.mode === "week2Diary" ? 5 :
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
      if (state.mode === "week2Diary") return renderWeek2Diary();

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
      const week2Event = isWeek2 ? week2DailyEvent(state.week2Main, state.week2ActionsUsed) : null;
      document.getElementById("sceneLabel").textContent = isWeek2
        ? week2Event.scene
        : "平日晚上只有一點時間。你可以把角色訊息變成準備，也可以打工補預算，或先休息避免週末體力不足。";
      document.getElementById("eventTitle").textContent = isWeek2
        ? week2Event.title
        : `${days[state.day]} 晚上的自由時間`;
      document.getElementById("speakerAvatar").innerHTML = isWeek2 ? avatarHtml(week2Event.speaker) || state.characters[week2Event.speaker].avatar : "行";
      document.getElementById("speakerAvatar").style.background = isWeek2 ? state.characters[week2Event.speaker].color : "#2f8b7d";
      document.getElementById("speakerName").textContent = isWeek2 ? state.characters[week2Event.speaker].name : "平日行動";
      document.getElementById("dialogueText").textContent = isWeek2
        ? `${week2Event.text}\n\n${state.actionPrompt || "選擇今天晚上的行動。"}`
        : state.actionPrompt || "選擇今天晚上的行動。";
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
      const currentActive = new Set(activeCombos().map((entry) => entry.combo.id));
      const preview = comboStates(it).filter((entry) =>
        entry.owned.some((tag) => it.tags.includes(tag)) &&
        (entry.active || entry.missing.length <= 1)
      );
      const activating = preview.filter((entry) => entry.active && !currentActive.has(entry.combo.id));
      const lacksBudget = state.budget < it.price;
      const lacksCapacity = totalLoad() + it.weight > state.loadMax;
      const canBuy = !lacksBudget && !lacksCapacity;
      const checkTip = matches.length
        ? matches.map((c) => `${state.characters[c.sourceCharacter].name}：「${c.sourceText}」`).join("\n")
        : "目前沒有直接對應 checklist，但仍可能提高體驗。";
      const comboTip = preview.length
        ? preview.map((entry) => `${entry.combo.name}：${entry.active ? "買下後啟動" : `還缺 ${entry.missing.join(" / ")}`}`).join("\n")
        : "沒有接近中的 build。";
      const tooltip = `${checkTip}\n\nBuild 預覽：\n${comboTip}`;
      return `
        <div class="item-card ${matches.length || activating.length ? "match" : ""}" title="${escapeAttr(tooltip)}">
          ${matches.length ? `<div class="corner">可完成 ${matches.length}</div>` : activating.length ? `<div class="corner build-corner">可啟動 ${activating.length}</div>` : ""}
          <h3>${it.name}</h3>
          <p>${it.desc}</p>
          <div class="tags">${it.tags.map((tag) => `<span class="mini-tag">${tag}</span>`).join("")}</div>
          ${renderComboPreview(preview)}
          <div class="item-meta"><span>${it.price} 圓</span><span>${typeLabel(itemType(it))} / 負重 ${it.weight}</span></div>
          <button class="btn primary" onclick="buyItem('${it.id}')" ${canBuy ? "" : "disabled"}>${buyButtonLabel(canBuy, lacksBudget, lacksCapacity)}</button>
        </div>
      `;
    }


    function buyButtonLabel(canBuy, lacksBudget, lacksCapacity) {
      if (canBuy) return "購買";
      if (lacksBudget && lacksCapacity) return "預算 / 容量不足";
      if (lacksBudget) return "預算不足";
      return "背包容量不足";
    }


    function renderComboPreview(entries) {
      if (!entries.length) return "";
      return `
        <div class="combo-preview">
          ${entries.slice(0, 3).map((entry) => `
            <div class="combo-chip ${entry.active ? "active" : ""}">
              <b>${entry.active ? "啟動" : "接近"} ${entry.combo.name}</b>
              <span>${entry.active ? entry.combo.desc : `缺 ${entry.missing.join(" / ")}`}</span>
            </div>
          `).join("")}
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
          <div class="summary-card"><b>Build</b><span>${activeCombos().length}</span></div>
          <div class="summary-card"><b>主要互動</b><span>${state.characters[result.main].avatar}</span></div>
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
          啟動 Build：${activeCombos().map((entry) => entry.combo.name).join("、") || "無"}<br>
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


    function week2DailyEvent(routeId, index) {
      const routeEvents = {
        rin: [
          { speaker: "rin", title: "第二週準備 1 / 3：書店地圖角落", scene: "放學後，你在書店的旅遊地圖區又遇見凜。她沒有打招呼，只把湖畔營地那一頁稍微推向你。", text: "凜指著湖邊小字標註的風速，說那裡晚上可能比照片看起來更冷。她沒有要求你做什麼，但你聽得出這是提醒。" },
          { speaker: "rin", title: "第二週準備 2 / 3：距離感練習", scene: "你想幫忙查更多資料，卻差點把行程排得太滿。凜看著你寫滿的筆記，沉默了一下。", text: "「不用全部安排好。」凜的聲音很平。你意識到，對她來說，留白也是露營的一部分。" },
          { speaker: "rin", title: "第二週準備 3 / 3：出發前訊息", scene: "出發前一晚，凜只傳來一張湖面照片。照片裡沒有文字，但你看得出她是在確認你會不會來。", text: "你回覆前停了一下，決定不要用太長的訊息打擾她。這次準備的重點，是讓安靜變得舒服。" }
        ],
        nadeshiko: [
          { speaker: "nadeshiko", title: "第二週準備 1 / 3：菜單草案", scene: "撫子把早餐菜單寫得像小型餐廳。主食、湯、甜點，每一項旁邊都畫了星星。", text: "你發現真正的問題不是她沒有想法，而是想法太多。這週需要在期待和背包負重之間抓平衡。" },
          { speaker: "nadeshiko", title: "第二週準備 2 / 3：試吃邀請", scene: "撫子放學後拿著一小包食材跑來，眼睛亮到讓人很難拒絕。", text: "她說只是試吃一下，但你看見她已經把下一次露營的餐桌想像好了。準備熱料理，大概會讓她很開心。" },
          { speaker: "nadeshiko", title: "第二週準備 3 / 3：份量確認", scene: "出發前，撫子很認真地問：早餐可以稍微豪華一點嗎？", text: "你想起背包容量和預算。讓撫子開心很重要，但讓大家真的吃得下也很重要。" }
        ],
        chiaki: [
          { speaker: "chiaki", title: "第二週準備 1 / 3：改造草圖", scene: "千明把草圖攤在桌上，線條豪邁得像大型工程圖。", text: "你看了三秒，發現有一個支撐點可能會歪。千明立刻說那是原型機的浪漫。" },
          { speaker: "chiaki", title: "第二週準備 2 / 3：百元商店會議", scene: "千明在貨架前快速比價，像在進行一場小型戰略會議。", text: "她想用最少預算做出最大效果。這週如果能湊出省錢和改造，應該會很合她的節奏。" },
          { speaker: "chiaki", title: "第二週準備 3 / 3：企劃壓力", scene: "出發前，千明一邊笑一邊改企劃表，但你注意到她比平常多看了幾次預算欄。", text: "她不是不安，只是不想讓大家失望。幫她把混亂變成可執行的計畫，可能比單純稱讚更有用。" }
        ],
        aoi: [
          { speaker: "aoi", title: "第二週準備 1 / 3：溫泉路線", scene: "葵把回程路線傳給你，還標出幾個看起來很舒服的休息點。", text: "她說這只是順手查的，但每個點都有營業時間和價格。你開始覺得，她的玩笑常常包著照顧人的心思。" },
          { speaker: "aoi", title: "第二週準備 2 / 3：熱茶閒聊", scene: "葵問你冷天露營最需要什麼，語氣像在考你。", text: "你回答熱茶時，她笑著說答對一半。另一半，是知道什麼時候該停下來休息。" },
          { speaker: "aoi", title: "第二週準備 3 / 3：玩笑的分寸", scene: "出發前，葵又講了一個聽起來很真的小故事。你差點認真追問，她笑瞇瞇地看著你。", text: "你慢慢抓到她的節奏：配合玩笑，但不要急著拆穿。這大概也是一種溫柔。" }
        ],
        ena: [
          { speaker: "ena", title: "第二週準備 1 / 3：竹輪照片", scene: "惠那傳來竹輪趴在露營包旁邊的照片。牠看起來像已經準備出發。", text: "照片下面只寫了一句：牠好像很期待。你知道這句話其實是在提醒寵物用品和保暖。" },
          { speaker: "ena", title: "第二週準備 2 / 3：拍照建議", scene: "惠那看著你手機裡的照片，說大家看鏡頭時反而不像平常。", text: "她說自然的瞬間比較有趣。也許這週與其追求漂亮，不如準備能留下日常感的東西。" },
          { speaker: "ena", title: "第二週準備 3 / 3：寵物友善確認", scene: "出發前，惠那確認營地規則、氣溫和竹輪的用品。她說得很輕鬆，但每一項都很仔細。", text: "你發現她不是隨便加入露營，而是在用自己的方式照顧大家，包含竹輪。" }
        ]
      };
      const list = routeEvents[routeId] || routeEvents.rin;
      return list[Math.min(index, list.length - 1)];
    }


    function week2ArrivalBeat(routeId) {
      const texts = {
        rin: "到達營地：湖邊風比預報還冷，凜先把機車停好，沒有急著說話，只用眼神確認你有沒有跟上。",
        nadeshiko: "到達營地：撫子一下車就望向炊事區，像是已經聽見鍋子冒泡的聲音。這次露營從一開始就帶著食物的期待。",
        chiaki: "到達營地：千明拿著企劃表站在營位中央，宣布第二彈改造計畫正式開始。大家還沒放下背包，她已經開始分配任務。",
        aoi: "到達營地：葵先看了看回程方向，又看了看大家的臉色。她說這只是確認路線，但你知道她已經在想露營後怎麼讓大家恢復。",
        ena: "到達營地：惠那先替竹輪確認地面溫度和休息位置，然後才慢慢抬頭看風景。她的節奏很輕，卻很仔細。"
      };
      return texts[routeId] || texts.rin;
    }


    function week2PrepBeat(routeId, completed, total) {
      const ratio = total ? completed / total : 0;
      const qualityText = ratio >= 1 ? "準備幾乎都對上了角色提到的期待。" : ratio > 0 ? "準備有抓到重點，但還留了一點空隙。" : "準備方向有些偏掉，只能靠現場補救。";
      const routeText = {
        rin: "你刻意沒有把營位安排得太熱鬧，留了一塊能安靜看湖的空間。",
        nadeshiko: "你把食材攤開檢查，撫子在旁邊努力忍住不要立刻開始煮。",
        chiaki: "你和千明確認材料，企劃表上的箭頭終於看起來比較像計畫。",
        aoi: "你把熱茶和回程休息點重新確認，讓露營不只停在晚上。",
        ena: "你替竹輪整理位置，也確認相機和保暖用品有沒有帶齊。"
      };
      return `準備與搭營：${routeText[routeId] || routeText.rin}${qualityText}`;
    }


    function week2ConflictBeat(routeId, activeIds) {
      const has = (id) => activeIds.includes(id);
      if (routeId === "rin") {
        return has("winter_comfort") || has("quiet_lake")
          ? "小衝突：風突然變強，你差點想一直問凜冷不冷。但保暖和安靜位置已經準備好，你只把熱飲放到她手邊，沒有打破她的節奏。"
          : "小衝突：你擔心凜會冷，連續問了好幾次要不要幫忙。凜沒有生氣，但你感覺自己稍微靠得太近了。";
      }
      if (routeId === "nadeshiko") {
        return has("camp_dinner") || has("group_hotpot")
          ? "小衝突：菜單一度膨脹到背包快裝不下。幸好主食和熱料理已經成形，你們把多餘配料刪掉，晚餐反而變得更清楚。"
          : "小衝突：撫子的菜單越列越長，最後不得不臨時刪掉幾樣。她雖然笑著接受，但你知道下次要更早控制份量。";
      }
      if (routeId === "chiaki") {
        return has("yakatsu_diy")
          ? "小衝突：改造道具第一次組起來有點歪。你們用省錢材料補強支點，千明立刻把失誤稱為成功前的實驗數據。"
          : "小衝突：改造道具一度站不穩，千明嘴上說這是原型機特色，但你看得出她有點慌。";
      }
      if (routeId === "aoi") {
        return has("onsen_finish") || has("healing_break")
          ? "小衝突：大家收拾到一半開始疲累。你把熱茶和休息收尾安排好，葵笑著說這才不是偷懶，是正確的冬露戰術。"
          : "小衝突：你一開始把葵的玩笑當真，差點認真修正整個行程。葵笑著帶過，但你感覺自己還在抓她的分寸。";
      }
      return has("chikuwa_care") || has("memory_photo")
        ? "小衝突：竹輪一開始有點不安，拍照時大家也太刻意。你先整理牠的位置，再抓自然的瞬間，惠那看起來明顯放鬆。"
        : "小衝突：你差點忘了竹輪的休息位置，拍照也只拍到大家看鏡頭的僵硬表情。惠那沒有責怪你，只輕輕提醒下次慢一點。";
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
      const triggeredCombos = activeCombos();
      triggeredCombos.forEach((entry) => applyEffects(entry.combo.effects));
      const score = 80 + completed * 28 + state.stats.chill + state.stats.cooking + state.stats.scenery + triggeredCombos.length * 8;
      const beats = [];
      const chosen = route.campChoices[state.week2CampChoice ?? 0];
      if (chosen) {
        applyEffects(chosen.effects);
      }

      beats.push(week2ArrivalBeat(routeId));
      beats.push(week2PrepBeat(routeId, completed, total));
      beats.push(week2ConflictBeat(routeId, triggeredCombos.map((entry) => entry.combo.id)));

      if (routeId === "rin") {
        if (quality === "perfect") {
          beats.push("夜晚角色事件：你把安靜露營用品和防風熱飲都準備好了。湖邊風很冷，但兩個人坐下來時，凜沒有急著拿出書，而是先說：「這裡，還不錯吧。」");
          char.affection += 5; char.trust += 3; char.sync += 4;
        } else if (quality === "good") {
          beats.push("夜晚角色事件：準備不是完美，但至少抓住了凜最在意的方向。她把熱飲杯捧在手裡，安靜地看了一會兒湖面。你沒有催她說話。");
          char.affection += 3; char.sync += 2;
        } else {
          beats.push("夜晚角色事件：這次準備有點跟不上湖邊的冷風。凜借了你一點備品，語氣很平淡：『下次先看風向。』");
          char.trust += 1;
        }
      }

      if (chosen) {
        beats.push(`露營選擇回饋：${chosen.result}`);
      }

      if (routeId === "nadeshiko") {
        if (quality === "perfect") {
          beats.push("夜晚角色事件：早餐主食、甜點和熱飲都準備好了。撫子一邊吃一邊發出幸福到快融化的聲音，最後很認真地替這次早餐命名。");
          char.affection += 5; char.trust += 3; char.sync += 3;
        } else if (quality === "good") {
          beats.push("夜晚角色事件：雖然少了一點配料，但熱呼呼的早餐還是成功了。撫子笑著說，只要在露營地吃，好吃度會自動加倍。");
          char.affection += 3; char.trust += 1;
        } else {
          beats.push("夜晚角色事件：早餐挑戰變成了泡麵補救會。撫子倒是很開心，說泡麵也是很棒的露營早餐，但你感覺下次可以讓她更驚喜。");
          char.affection += 1;
        }
      }

      if (routeId === "chiaki") {
        if (quality === "perfect") {
          beats.push("夜晚角色事件：改造材料和團體用品都準備齊了。千明把簡易風防組起來時，像宣布重大發明一樣抬頭挺胸。她甚至要求大家鼓掌三秒。");
          char.affection += 4; char.trust += 4; char.sync += 3;
        } else if (quality === "good") {
          beats.push("夜晚角色事件：改造計畫只完成一半，但千明很擅長把半成品變成活動。大家邊修邊笑，反而很有野活味。");
          char.affection += 3; char.trust += 2;
        } else {
          beats.push("夜晚角色事件：第二彈改造企劃幾乎變成口頭發表。千明雖然吐槽準備不足，還是立刻開始畫第三彈草圖，彷彿失敗只是企劃的一部分。");
          char.affection += 1;
        }
      }

      if (routeId === "aoi") {
        if (quality === "perfect") {
          beats.push("夜晚角色事件：熱茶和溫泉收尾都安排好了。葵笑著說你很懂得把露營玩到最後一分鐘，也懂得什麼時候該放鬆。");
          char.affection += 4; char.trust += 3; char.sync += 4;
        } else if (quality === "good") {
          beats.push("夜晚角色事件：雖然沒有做到完美收尾，但你至少記得讓大家暖起來。葵捧著杯子，笑著說這樣就很像冬天露營了。");
          char.affection += 3; char.sync += 2;
        } else {
          beats.push("夜晚角色事件：收尾有點匆忙。葵笑著說下次她會提醒你，然後補上一句：不是想偷懶喔。");
          char.affection += 1;
        }
      }

      if (routeId === "ena") {
        if (quality === "perfect") {
          beats.push("夜晚角色事件：竹輪用品和拍照準備都很完整。惠那翻著照片，說你抓到的瞬間比擺拍更像大家。");
          char.affection += 4; char.trust += 3; char.sync += 3;
        } else if (quality === "good") {
          beats.push("夜晚角色事件：準備雖然少了一點，但竹輪看起來很舒服。惠那看著牠鑽進毯子的樣子，露出很放鬆的笑。");
          char.affection += 3; char.trust += 1;
        } else {
          beats.push("夜晚角色事件：這次差點忘了竹輪的份。惠那沒有責怪你，只是把竹輪抱起來說，下次要一起記得喔。");
          char.affection += 1;
        }
      }

      triggeredCombos.forEach((entry) => {
        beats.push(comboStoryText(entry.combo.id, "week2", routeId));
      });

      state.week2CampResult = {
        routeId,
        completed,
        total,
        completedLabels: state.checklist
          .filter((c) => routeChecks.includes(c.id) && c.status === "done")
          .map((c) => c.label),
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
          <div class="summary-card"><b>Build</b><span>${activeCombos().length}</span></div>
          <div class="summary-card"><b>體驗分</b><span>${Math.round(result.score)}</span></div>
        </div>
        <div class="diary-card">
          <b>第二週回憶卡</b>
          路線角色：${char.name}<br>
          LINE 回覆：${week2Routes[result.routeId].replies[state.week2Reply ?? 0].label}<br>
          露營選擇：${week2Routes[result.routeId].campChoices[state.week2CampChoice ?? 0].label}<br>
          完成目標：${result.completedLabels.join("、") || "無"}<br>
          啟動 Build：${activeCombos().map((entry) => entry.combo.name).join("、") || "無"}<br>
          角色一句話：${week2FinalLine(result.routeId, result.quality)}<br>
          下一週預告：${week2NextPreview(result.routeId, result.quality)}
        </div>
        <div class="end-note">
          <b>第二週露營結束</b>
          寫下露營日記後，會整理本週 Build、完成目標與目前最接近的角色路線。
        </div>
        <div style="margin-top:14px;">
          <button class="btn primary" onclick="goToWeek2Diary()">寫第二週日記</button>
          <button class="btn primary" onclick="newGame()">再測一次</button>
        </div>
      `;
    }


    function renderWeek2Diary() {
      document.querySelector(".dialogue").classList.remove("phone-chat");
      const result = week2CampResults();
      const lock = routeLockSummary(result.routeId);
      const char = state.characters[lock.main.id];
      document.getElementById("sceneLabel").textContent = "週日早上，你把第二週的準備、露營時的小失誤，以及角色的反應整理成日記。這次日記也會顯示目前最接近的個人線。";
      document.getElementById("eventTitle").textContent = "第二週日記：路線整理";
      document.getElementById("speakerAvatar").innerHTML = avatarHtml(lock.main.id) || char.avatar;
      document.getElementById("speakerAvatar").style.background = char.color;
      document.getElementById("speakerName").textContent = "第二週露營日記";
      document.getElementById("dialogueText").textContent =
        `這週主要互動是：${state.characters[result.routeId].name}。\n` +
        `露營結果：${result.rank}。\n` +
        `目前最接近的路線是：${char.name}。\n\n` +
        lock.text;
      document.getElementById("mainAction").innerHTML = `
        <div class="summary">
          <div class="summary-card"><b>主路線</b><span>${char.avatar}</span></div>
          <div class="summary-card"><b>路線分</b><span>${lock.main.value}</span></div>
          <div class="summary-card"><b>候補</b><span>${lock.candidates.length}</span></div>
          <div class="summary-card"><b>Build</b><span>${activeCombos().length}</span></div>
        </div>
        <div class="diary-card">
          <b>第二週回憶卡</b>
          路線角色：${state.characters[result.routeId].name}<br>
          完成目標：${result.completedLabels.join("、") || "無"}<br>
          啟動 Build：${activeCombos().map((entry) => entry.combo.name).join("、") || "無"}<br>
          角色一句話：${week2FinalLine(result.routeId, result.quality)}<br>
          下一週預告：${week2NextPreview(result.routeId, result.quality)}
        </div>
        <div class="route-lock">
          <b>路線候補</b>
          ${lock.rows.map((row) => `
            <div class="route-lock-row ${row.id === lock.main.id ? "active" : ""}">
              ${avatarHtml(row.id, "mini-avatar")}
              <span>${state.characters[row.id].name}</span>
              <small>${row.value} 分</small>
              <em>${row.note}</em>
            </div>
          `).join("")}
        </div>
        <div class="end-note">
          <b>第三週預告</b>
          ${thirdWeekPreview(lock.main.id, lock.status)}
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


    function week2NextPreview(id, quality) {
      const strong = quality === "perfect";
      if (id === "rin") return strong ? "凜可能會提出更遠的單人露營路線。" : "凜會提醒你先把安全與風向查好。";
      if (id === "nadeshiko") return strong ? "撫子可能會開始規劃更完整的露營菜單。" : "撫子會拉你一起補強料理準備。";
      if (id === "aoi") return strong ? "葵可能會把溫泉收尾變成真正的路線事件。" : "葵會用玩笑提醒你別忘了休息節奏。";
      if (id === "ena") return strong ? "惠那可能會邀你一起找寵物友善營地。" : "惠那會再傳竹輪照片提醒你準備。";
      return strong ? "千明可能會把改造企劃升級成正式野活作戰。" : "千明會要求下次先寫預算表。";
    }


    function routeLockSummary(routeId) {
      const rows = routeCandidates();
      const main = rows[0];
      const second = rows[1];
      const gap = main.value - (second ? second.value : 0);
      const candidates = rows.filter((row) => row.id !== main.id && main.value - row.value <= 8);
      const routeMatched = main.id === routeId;
      const status = main.value >= 35 && gap >= 8 && routeMatched ? "locked" :
        main.value >= 28 ? "leaning" : "open";
      const text = status === "locked"
        ? `${state.characters[main.id].name} 的路線已經很明顯。第三週可以開始把事件推向個人線。`
        : status === "leaning"
          ? `${state.characters[main.id].name} 目前最接近，但候補路線仍有機會追上。第三週可以讓玩家做最後確認。`
          : "目前還沒有明確鎖定角色線。第三週適合先走共通事件，讓玩家再透過準備和對話拉開差距。";
      return {
        main,
        candidates,
        rows: rows.map((row, index) => ({
          id: row.id,
          value: row.value,
          note: row.id === main.id ? routeStatusLabel(status) :
            index === 1 ? `差 ${main.value - row.value}` :
            row.value >= 20 ? "可追趕" : "尚未接近"
        })),
        status,
        text
      };
    }


    function routeStatusLabel(status) {
      if (status === "locked") return "個人線預備";
      if (status === "leaning") return "明顯傾向";
      return "共通線";
    }


    function thirdWeekPreview(id, status) {
      const prefix = status === "locked" ? "第三週可進入個人線前段：" :
        status === "leaning" ? "第三週將進入最後確認：" :
        "第三週仍會維持共通線：";
      const previews = {
        rin: "凜可能會邀你討論更遠的營地，重點會放在距離感、安全準備與安靜陪伴。",
        nadeshiko: "撫子可能會提出更完整的料理計畫，重點會放在菜單取捨、分工與一起期待下一餐。",
        chiaki: "千明可能會把改造企劃升級，重點會放在預算、責任感與野活社的團體回憶。",
        aoi: "葵可能會把溫泉收尾變成真正的談心事件，重點會放在玩笑背後的照顧與真心。",
        ena: "惠那可能會邀你找寵物友善營地，重點會放在竹輪、拍照與自然的陪伴。"
      };
      return `${prefix}${previews[id] || previews.rin}`;
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
      document.getElementById("loadTag").textContent = `負重 ${totalLoad()} / ${state.loadMax}`;
      const box = document.getElementById("inventory");
      if (!state.bag.length) {
        box.innerHTML = `<p class="empty">背包還是空的。採買時先看黃色標記，它們通常能回應角色剛剛說過的事。</p>`;
        return;
      }
      const canSell = !isCampingScene();
      box.innerHTML = state.bag.map((it, index) => `
        <div class="bag-item">
          <div>
            <b>${it.name}</b>
            <small>${typeLabel(itemType(it))} / ${it.tags.join(" / ")}</small>
          </div>
          <div class="bag-side">
            <span>重 ${it.weight}</span>
            ${canSell ? `<button class="mini-btn" type="button" data-sell-index="${index}">賣 ${resaleValue(it)}</button>` : ""}
          </div>
        </div>
      `).join("");
    }


    function renderBuilds() {
      const active = activeCombos();
      document.getElementById("buildProgress").textContent = `${active.length}`;
      const box = document.getElementById("builds");
      const entries = relevantCombos().slice(0, 7);
      if (!entries.length) {
        box.innerHTML = `<p class="empty">還沒有形成 build。買下物品後，這裡會顯示已啟動或差一類就能完成的組合。</p>`;
        return;
      }
      box.innerHTML = entries.map((entry) => `
        <div class="build-card ${entry.active ? "active" : "near"}" title="${escapeAttr(entry.combo.desc)}">
          <div class="build-head">
            <b>${entry.combo.name}</b>
            <span>${entry.active ? "已啟動" : `缺 ${entry.missing.length}`}</span>
          </div>
          <div class="build-tags">
            ${entry.combo.tags.map((tag) => `<span class="mini-tag ${entry.owned.includes(tag) ? "owned" : "missing"}">${tag}</span>`).join("")}
          </div>
          <small>${entry.active ? entry.combo.desc : `還缺：${entry.missing.join(" / ")}`}</small>
        </div>
      `).join("");
    }


    function renderRouteProgress() {
      const box = document.getElementById("routeProgress");
      const routes = routeCandidates();
      const main = state.week === 2 && state.week2Main ? state.week2Main : routes[0].id;
      document.getElementById("routeTag").textContent = state.week === 2
        ? `${state.characters[main].avatar} 路線中`
        : `${state.characters[main].avatar} 最接近`;
      box.innerHTML = `
        <div class="route-lead">
          ${avatarHtml(main, "mini-avatar")}
          <div>
            <b>${state.characters[main].name}</b>
            <span>${state.week === 2 ? "目前進行中的第二週路線" : "下一週最可能收到 LINE 的角色"}</span>
          </div>
        </div>
        <div class="route-list">
          ${routes.map((entry) => {
            const char = state.characters[entry.id];
            const width = Math.max(4, Math.min(100, entry.value));
            return `
              <div class="route-row ${entry.id === main ? "active" : ""}">
                ${avatarHtml(entry.id, "mini-avatar")}
                <span>${char.name.slice(-2)}</span>
                <div class="meter"><span style="width:${width}%; background:${char.color}"></span></div>
                <b>${entry.value}</b>
              </div>
            `;
          }).join("")}
        </div>
      `;
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
