window.GameData = window.GameData || {};
window.GameData.week2Routes = {
      rin: {
        title: "第二週：凜的湖畔私訊",
        chatTitle: "志摩凜",
        scene: "第一週之後，凜傳來一個更安靜的湖畔營地連結。訊息不長，但比上週更像邀請。",
        messages: [
          { speaker: "rin", text: "上次，還不錯。" },
          { speaker: "rin", text: "這週想去一個比較安靜的湖邊。" },
          { speaker: "rin", text: "要來也可以。風大，熱飲最好帶。" }
        ],
        replies: [
          { label: "先查風向", text: "我先查風向和夜間氣溫。到時候別被風吹到失溫。", effects: { rin: { trust: 3, sync: 2 }, scenery: 3 }, extraChecks: [] },
          { label: "我帶熱飲", text: "我帶熱飲。到時候不用特別聊天，安靜坐著也很好。", effects: { rin: { affection: 2, sync: 4 }, chill: 3 }, extraChecks: [] },
          { label: "問問大家？", text: "要不要也問問大家？人多應該比較熱鬧。", effects: { rin: { affection: 1, sync: -2 }, bond: 2 }, extraChecks: [] }
        ],
        campChoices: [
          { label: "安靜地把熱飲遞給凜", result: "你沒有急著開話題，只把熱飲放到凜伸手就能拿到的位置。過了一會兒，她輕輕說了聲謝謝。那句話很小，卻剛好沒有被風蓋過。", effects: { rin: { affection: 2, sync: 3 } } },
          { label: "詢問她下次想去哪裡", result: "你等凜收好杯子後才問下一個營地。她沒有立刻回答，而是把地圖往你這邊推了一點，指向更遠的湖邊。", effects: { rin: { trust: 3 } } },
          { label: "提議拍一張湖景照", result: "你沒有拍人，只拍了湖面、杯子和遠處的營燈。凜看了照片一眼，小聲說構圖還不錯。", effects: { rin: { affection: 2 }, scenery: 4 } }
        ],
        preferredTags: ["安靜", "風景", "保暖", "熱飲"],
        checks: [
          check("week2_rin_quiet", "凜想去安靜的湖邊", "凜傳來安靜湖邊的營地連結。", "rin", ["安靜", "風景"]),
          check("week2_rin_wind", "湖邊風大，熱飲最好帶", "凜提醒湖邊風大，熱飲或保暖都會有用。", "rin", ["保暖", "熱飲"])
        ],
        note: "第二週凜線傾向：安靜、風景、熱飲、防風。"
      },
      nadeshiko: {
        title: "第二週：撫子的菜單轟炸",
        chatTitle: "野外活動社",
        scene: "週一晚上，撫子連續傳來好幾張料理照片。看來她已經把下一次露營想像成戶外餐桌了。",
        messages: [
          { speaker: "nadeshiko", text: "上次吃熱食的時候，我一直在想……" },
          { speaker: "nadeshiko", text: "露營早餐一定也超棒！熱湯、烤麵包、甜點！" },
          { speaker: "chiaki", text: "撫子，妳的早餐是不是已經變成晚餐份量了？" }
        ],
        replies: [
          { label: "一起排早餐菜單", text: "一起排早餐菜單吧。主食、湯、甜點都要有，但份量先正常一點。", effects: { nadeshiko: { affection: 3, sync: 2 }, cooking: 3 }, extraChecks: [] },
          { label: "主食我來，甜點妳挑", text: "主食我來準備，甜點交給撫子挑。這樣應該最安心。", effects: { nadeshiko: { trust: 2, affection: 2 }, cooking: 2 }, extraChecks: [] },
          { label: "先算預算", text: "先算預算吧。不然早餐可能會變成露營自助餐。", effects: { nadeshiko: { affection: 1 }, chiaki: { trust: 2 }, bond: 1 }, extraChecks: [] }
        ],
        campChoices: [
          { label: "讓撫子決定最後調味", result: "撫子捧著湯匙，表情嚴肅得像料理評審。下一秒她眼睛發亮，宣布這鍋湯可以列入『下次還要吃』名單。", effects: { nadeshiko: { affection: 3, sync: 2 }, cooking: 4 } },
          { label: "把甜點留到看風景時吃", result: "你們把甜點帶到湖邊。撫子咬下一口後安靜了兩秒，接著用很小的聲音說：早起真好。", effects: { nadeshiko: { affection: 3 }, scenery: 3 } },
          { label: "請大家分工準備早餐", result: "切菜、煮湯、擺盤同時進行，場面一度很像小型廚房災難。但撫子笑得最開心，說這樣才像大家一起露營。", effects: { nadeshiko: { trust: 2 }, bond: 4 } }
        ],
        preferredTags: ["主食", "熱料理", "甜點", "熱飲"],
        checks: [
          check("week2_nade_breakfast", "撫子想做露營早餐", "撫子想挑戰熱湯、主食和露營早餐。", "nadeshiko", ["主食", "熱料理"]),
          check("week2_nade_sweet", "早餐後想要甜甜的東西", "撫子提到早餐後也想要甜點或熱飲。", "nadeshiko", ["甜點", "熱飲"])
        ],
        note: "第二週撫子線傾向：早餐、主食、甜點、熱料理。"
      },
      chiaki: {
        title: "第二週：千明的改造企劃",
        chatTitle: "野外活動社",
        scene: "千明把上週的省錢經驗整理成一張新企劃圖，標題比內容還大。",
        messages: [
          { speaker: "chiaki", text: "上次證明了！低預算也能打出漂亮一仗！" },
          { speaker: "chiaki", text: "所以這週要升級成『野活改造計畫 第二彈』！" },
          { speaker: "nadeshiko", text: "第二彈聽起來好厲害！會有吃的嗎？" }
        ],
        replies: [
          { label: "我找改造材料", text: "我去找能改造的材料。這次至少讓它看起來像正式企劃。", effects: { chiaki: { trust: 3, sync: 2 }, bond: 1 }, extraChecks: [] },
          { label: "先列分工表", text: "先列分工表吧。誰買材料、誰組裝、誰負責在旁邊喊加油。", effects: { chiaki: { affection: 2, trust: 2 }, bond: 2 }, extraChecks: [] },
          { label: "先定預算上限", text: "預算上限要先決定。不然第二彈會變成錢包災難片。", effects: { chiaki: { sync: 3 }, nadeshiko: { affection: 1 } }, extraChecks: [] }
        ],
        campChoices: [
          { label: "照千明的圖紙組裝", result: "你照著千明的圖紙組起來，中間一度把零件上下顛倒。千明大喊那是『原型機特有的個性』，完成時笑得像社長揭幕。", effects: { chiaki: { affection: 2, trust: 3 } } },
          { label: "提出更穩的替代方案", result: "你把結構改得更穩。千明先露出不甘心的臉，三秒後就把你的方案寫進『第三彈草案』，還加了兩個驚嘆號。", effects: { chiaki: { trust: 3, sync: 2 } } },
          { label: "拉大家一起測試", result: "大家輪流測試改造道具，現場變成臨時發表會。千明站在中間宣布：這就是野活的實驗精神。", effects: { chiaki: { affection: 3 }, bond: 4 } }
        ],
        preferredTags: ["省錢", "改造", "團體", "補救"],
        checks: [
          check("week2_chiaki_diy", "千明要做改造計畫第二彈", "千明提出野活改造計畫第二彈，需要改造或省錢材料。", "chiaki", ["改造", "省錢"]),
          check("week2_chiaki_group", "這次要讓大家一起參與", "千明想把改造變成團體活動。", "chiaki", ["團體", "省錢"])
        ],
        note: "第二週千明線傾向：省錢、改造、團體分工。"
      },
      aoi: {
        title: "第二週：葵的溫泉收尾",
        chatTitle: "野外活動社",
        scene: "第一週露營後，葵把附近溫泉和休息區整理成一張清單。她說得像開玩笑，但每個地點都查得很細。",
        messages: [
          { speaker: "aoi", text: "上次露營後啊，我一直在想一件很重要的事。" },
          { speaker: "aoi", text: "冬天露營的真正結尾，應該是熱茶或溫泉。這不是偷懶，是戰略性恢復喔。" },
          { speaker: "chiaki", text: "講得好像很有道理！" }
        ],
        replies: [
          { label: "我查溫泉營地", text: "我先查附近有沒有能順路泡湯的營地。冬天收尾確實很重要。", effects: { aoi: { trust: 3, sync: 2 }, chill: 3 }, extraChecks: [] },
          { label: "熱茶我來準備", text: "那我準備熱茶。泡湯不一定能去，但至少可以讓大家暖一下。", effects: { aoi: { affection: 2, sync: 3 }, chill: 2 }, extraChecks: [] },
          { label: "妳是不是只是想泡湯", text: "你半開玩笑地問，葵笑瞇瞇地回：被發現了啊。", effects: { aoi: { affection: 2 }, bond: 2 }, extraChecks: [] }
        ],
        campChoices: [
          { label: "露營後先泡熱茶", result: "你沒有急著收完所有東西，而是先沖了熱茶。葵接過杯子，笑著說這才是懂冬露的人。", effects: { aoi: { affection: 3, sync: 2 }, chill: 3 } },
          { label: "安排溫泉休息", result: "你把回程休息點排得剛剛好。葵看著路線，說你比想像中還會照顧大家。", effects: { aoi: { trust: 3 }, chill: 4 } },
          { label: "陪她一起捉弄千明", result: "你配合葵把熱茶說成神秘秘方。千明差點真的相信，大家笑成一團。", effects: { aoi: { affection: 2 }, bond: 4 } }
        ],
        preferredTags: ["溫泉", "熱飲", "療癒", "團體"],
        checks: [
          check("week2_aoi_onsen", "葵想把溫泉排進回程", "葵提到冬天露營後，如果能泡湯會很舒服。", "aoi", ["溫泉", "療癒"]),
          check("week2_aoi_tea", "葵想準備熱茶收尾", "葵說熱茶也能讓冬露收尾變得舒服。", "aoi", ["熱飲", "療癒"])
        ],
        note: "第二週葵線傾向：溫泉、熱茶、放鬆收尾、配合玩笑。"
      },
      ena: {
        title: "第二週：惠那與竹輪的營地清單",
        chatTitle: "齊藤惠那",
        scene: "惠那傳來竹輪看著露營包的照片，接著丟來幾個寵物友善營地連結。",
        messages: [
          { speaker: "ena", text: "竹輪好像記得上次的味道了。" },
          { speaker: "ena", text: "如果下次去寵物友善的地方，牠應該會很開心。" },
          { speaker: "ena", text: "啊，也可以幫大家拍照。自然一點的那種。" }
        ],
        replies: [
          { label: "我查寵物友善營地", text: "我先查能帶寵物去的營地，也確認夜間溫度。", effects: { ena: { trust: 3, sync: 2 }, scenery: 2 }, extraChecks: [] },
          { label: "竹輪用品我準備", text: "竹輪的保暖和點心我來注意。牠也是露營成員。", effects: { ena: { affection: 3, trust: 2 }, chill: 2 }, extraChecks: [] },
          { label: "拍照交給我", text: "我試著拍大家自然的表情。不過如果被發現，妳要幫我打圓場。", effects: { ena: { affection: 2, sync: 2 }, scenery: 3 }, extraChecks: [] }
        ],
        campChoices: [
          { label: "先替竹輪整理保暖區", result: "你把小毯子鋪好，竹輪很自然地鑽了進去。惠那看了一眼，笑著說牠好像認可你了。", effects: { ena: { affection: 3, trust: 2 }, chill: 2 } },
          { label: "拍下大家自然的瞬間", result: "你沒有喊大家看鏡頭，只拍下準備料理、搭帳和笑出來的瞬間。惠那說這種照片比較像回憶。", effects: { ena: { affection: 2, sync: 3 }, scenery: 3 } },
          { label: "陪惠那一起逗竹輪", result: "惠那把竹輪抱起來，故意用很正式的語氣介紹牠是本日營地主任。你配合鼓掌，她笑得很開心。", effects: { ena: { affection: 3 }, bond: 3 } }
        ],
        preferredTags: ["寵物", "保暖", "拍照", "風景"],
        checks: [
          check("week2_ena_pet", "惠那想去寵物友善營地", "惠那提到竹輪也想一起露營，需要寵物或保暖用品。", "ena", ["寵物", "保暖"]),
          check("week2_ena_photo", "惠那想留下自然的照片", "惠那說想拍大家自然一點的表情。", "ena", ["拍照", "風景"])
        ],
        note: "第二週惠那線傾向：寵物、保暖、拍照、自然的陪伴。"
      }
    };
