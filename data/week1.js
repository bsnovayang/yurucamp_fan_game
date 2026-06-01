window.GameData = window.GameData || {};
window.GameData.days = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];
    window.GameData.daySubtitles = ["野活參觀", "書店偶遇", "群組聊天", "採買準備", "最後確認", "湖畔露營", "露營日記"];

    
window.GameData.events = [
      {
        day: 0,
        title: "轉學後的第一個邀請",
        scene: "放學後，撫子在走廊上聽見你提到露營雜誌，眼睛立刻亮了起來。",
        speaker: "nadeshiko",
        text: "欸？你也看露營雜誌嗎？\n我們學校有野外活動社喔！社辦雖然很小，可是大家一起準備、一起吃熱呼呼的東西，真的超開心！",
        choices: [
          choice("那我去看看", "撫子露出像發現新露營夥伴的表情。", { nadeshiko: { affection: 3, tendency: 2 }, bond: 3 }, []),
          choice("新手也可以嗎？", "你先確認自己能不能跟上，撫子很認真地點頭。", { nadeshiko: { trust: 2 }, stamina: 3 }, []),
          choice("有熱食的話我考慮", "撫子瞬間把話題拉到露營料理，氣氛變得很輕鬆。", { nadeshiko: { affection: 2, sync: 1 }, bond: 2 }, [])
        ]
      },
      {
        day: 1,
        title: "書店的露營雜誌",
        scene: "書店角落的露營雜誌只剩最後一本。你的手剛伸出去，旁邊也有人伸手拿同一本。",
        speaker: "rin",
        text: "啊。\n你也要看這本？\n……這期有湖邊營地。晚上會冷。不過，風景應該不錯。",
        choices: [
          choice("那我先查夜間氣溫", "凜看了你一眼，像是覺得這個反應還算可靠。", { rin: { trust: 2, sync: 2 }, scenery: 2 }, [
            check("rin_warm", "凜說湖邊晚上會冷", "凜提醒湖邊夜晚會冷，最好先準備保暖。", "rin", ["保暖"])
          ]),
          choice("風景好的話很值得去", "凜沒有多說，只把雜誌翻到湖景那頁。", { rin: { affection: 2, tendency: 2 }, scenery: 4 }, [
            check("rin_warm", "凜說湖邊晚上會冷", "凜提醒湖邊夜晚會冷，最好先準備保暖。", "rin", ["保暖"])
          ]),
          choice("要不要大家一起去？", "凜的反應慢了半拍。她沒有拒絕，但也沒有立刻答應。", { rin: { affection: 1, sync: -1 }, bond: 2 }, [
            check("rin_warm", "凜說湖邊晚上會冷", "凜提醒湖邊夜晚會冷，最好先準備保暖。", "rin", ["保暖"])
          ])
        ]
      },
      {
        day: 2,
        title: "野活群組的晚餐話題",
        scene: "晚上，野外活動社群組突然跳出一串訊息。撫子傳了一張熱騰騰鍋物照片。",
        format: "line",
        chatTitle: "野外活動社",
        messages: [
          { speaker: "nadeshiko", text: "我剛剛看到鍋物照片……肚子餓了。" },
          { speaker: "nadeshiko", text: "冬天露營如果能吃熱呼呼的晚餐，絕對會幸福到發光！" },
          { speaker: "chiaki", text: "先不要發光！鍋物配料一多，預算會先爆炸！" },
          { speaker: "aoi", text: "那露營完去泡湯怎麼樣？身體暖了，錢包也比較不會哭喔。大概。" }
        ],
        speaker: "nadeshiko",
        text: "冬天露營果然想吃熱呼呼的晚餐！如果湖邊很冷，大家一起吃鍋一定超幸福的！葵順手補了一句，露營後能泡湯或喝熱茶就更好了。",
        choices: [
          choice("那我負責準備熱食", "撫子傳來一排看起來很餓的貼圖。", { nadeshiko: { affection: 3, tendency: 3, sync: 2 }, cooking: 3 }, [
            check("nade_food", "撫子想吃熱呼呼的晚餐", "撫子提到冬天露營想吃熱食，主食或鍋物都可以。", "nadeshiko", ["熱料理", "主食"])
          ]),
          choice("先研究簡單食譜", "你把撫子的期待翻成可執行的菜單。", { nadeshiko: { trust: 2 }, cooking: 4, stamina: -2 }, [
            check("nade_food", "撫子想吃熱呼呼的晚餐", "撫子提到冬天露營想吃熱食，主食或鍋物都可以。", "nadeshiko", ["熱料理", "主食"])
          ]),
          choice("露營後泡湯也不錯", "葵傳來一個笑瞇瞇的貼圖，說你很懂冬天露營的收尾。撫子則開始思考泡湯後要不要再吃點東西。", { aoi: { affection: 3, tendency: 4, sync: 2 }, chill: 3 }, [
            check("aoi_onsen", "葵提到露營後想泡湯或喝熱茶", "葵說冬天露營後，如果能泡湯或喝熱茶會很舒服。", "aoi", ["溫泉", "熱飲", "療癒"])
          ])
        ]
      },
      {
        day: 3,
        title: "千明的省錢露營會議",
        scene: "野活社辦裡，千明把一張手寫企劃書拍在桌上，上面寫著大大的『低預算也能享受冬露』。",
        format: "line",
        chatTitle: "野外活動社",
        messages: [
          { speaker: "chiaki", text: "各位社員！本週企劃書完成了！" },
          { speaker: "chiaki", text: "標題：低預算冬露作戰。副標：用智慧打敗寒冷與錢包。" },
          { speaker: "nadeshiko", text: "省下來的錢可以買更多好吃的嗎？" }
        ],
        speaker: "chiaki",
        text: "裝備很貴沒錯，但露營的智慧就是用有限預算創造最大快樂！百元商店、改造、借用，全部都能派上用場！",
        choices: [
          choice("一起想省錢方案", "千明立刻把你列進企劃組，還分配了職稱。", { chiaki: { affection: 2, trust: 2, tendency: 3 }, bond: 2 }, [
            check("chiaki_budget", "千明想做省錢冬露作戰", "千明想用低預算和改造道具完成冬季露營。", "chiaki", ["省錢", "改造"])
          ], "shop"),
          choice("我去買能改造的材料", "你把千明的熱情變成比較不會爆炸的採買方向。", { chiaki: { trust: 3, sync: 2 }, bond: 1 }, [
            check("chiaki_budget", "千明想做省錢冬露作戰", "千明想用低預算和改造道具完成冬季露營。", "chiaki", ["省錢", "改造"])
          ], "shop"),
          choice("預算爆炸就糟了", "千明用力點頭，開始用一百圓為單位畫戰略圖。", { chiaki: { affection: 2 }, budgetSense: 4 }, [
            check("chiaki_budget", "千明想做省錢冬露作戰", "千明想用低預算和改造道具完成冬季露營。", "chiaki", ["省錢", "改造"])
          ], "shop")
        ]
      },
      {
        day: 4,
        title: "出發前的最後訊息",
        scene: "週五晚上，凜傳來天氣截圖。湖邊夜間氣溫比預想更低。",
        format: "line",
        chatTitle: "志摩凜",
        messages: [
          { speaker: "rin", text: "明天晚上，2 度左右。" },
          { speaker: "rin", text: "湖邊風大。" },
          { speaker: "rin", text: "有熱飲會比較好。沒有也能去，只是會冷。" },
          { speaker: "ena", text: "竹輪看到天氣預報就躲進毯子了。寵物也要保暖喔。" },
          { speaker: "ena", text: "如果有拍照的話，記得拍大家自然一點的表情。" }
        ],
        speaker: "rin",
        text: "明天晚上可能只有 2 度。\n如果有熱飲，應該會舒服很多。惠那也補了一張竹輪裹著毯子的照片，提醒大家保暖和拍照都很重要。",
        choices: [
          choice("我會補上熱飲", "凜回了一個短短的『嗯』。你感覺那大概是放心的意思。", { rin: { trust: 2, sync: 3 }, chill: 2 }, [
            check("rin_drink", "凜建議帶熱飲", "凜提醒夜晚有熱飲會舒服很多。", "rin", ["熱飲"])
          ], "shop"),
          choice("再檢查一次背包", "你把保暖、食材、熱飲重新確認了一遍。", { rin: { trust: 2 }, stamina: 2 }, [
            check("rin_drink", "凜建議帶熱飲", "凜提醒夜晚有熱飲會舒服很多。", "rin", ["熱飲"])
          ], "shop"),
          choice("也幫竹輪準備保暖用品", "惠那回了一張竹輪盯著鏡頭的照片，像是在確認你是不是真的會記得。", { ena: { affection: 3, tendency: 4, trust: 2 }, chill: 2 }, [
            check("ena_chikuwa", "惠那提醒竹輪也需要保暖", "惠那傳來竹輪裹毯子的照片，提醒寵物保暖和拍照都可以準備。", "ena", ["寵物", "保暖", "拍照"])
          ], "shop")
        ]
      }
    ];

    
