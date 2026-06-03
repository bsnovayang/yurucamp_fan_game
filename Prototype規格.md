# Prototype 規格

## 1. 第一版範圍

第一版 prototype 目標是做出可玩的「第一週垂直切片」。

不做完整角色線，不做美術素材，不做語音，只做純 HTML / CSS / JavaScript。

## 2. 必做功能

| 功能 | 說明 |
|---|---|
| 日程流程 | 週一至週日 |
| 對話事件 | 至少 5 個劇情事件 |
| Checklist | 角色對話生成目標，購物後打勾 |
| 商店 | 商品隨機但分類保底 |
| 背包 | 顯示物品、分類、重量 |
| 露營結算 | 根據 checklist 完成度演出不同結果 |
| 角色數值 | 好感、信任、節奏、傾向 |
| Tooltip | 滑鼠移到 checklist 或商品上顯示說明 |

## 3. 暫不做功能

- 存檔
- 多週完整路線
- 圖片 CG
- 語音
- 複雜料理 QTE
- 多語系
- 手機完整適配

## 4. 資料結構建議

### 4.1 Character

```js
{
  id: "rin",
  name: "志摩凜",
  affection: 0,
  trust: 0,
  sync: 0,
  tendency: 0,
  likedTags: ["安靜", "熱飲", "風景", "保暖"]
}
```

### 4.2 Item

```js
{
  id: "hot_cocoa",
  name: "熱可可粉",
  price: 500,
  weight: 1,
  tags: ["熱飲", "甜點"],
  effects: { chill: 8 }
}
```

### 4.3 Checklist

```js
{
  id: "rin_hot_drink",
  sourceCharacter: "rin",
  sourceText: "晚上如果有熱飲，應該會舒服很多。",
  label: "準備熱飲",
  requiredTags: ["熱飲"],
  status: "hinted"
}
```

### 4.4 Event

```js
{
  id: "camp_fire_talk",
  phase: "camp_night",
  character: "auto_highest_tendency",
  variants: ["miss", "normal", "good", "perfect"]
}
```

## 5. 第一版成功標準

Prototype 完成後，玩家應該能：

1. 看見角色在對話中提出期待
2. 在 checklist 看到該期待被記錄
3. 在商店辨識哪些商品能滿足期待
4. 買下物品後看到 checklist 打勾
5. 露營當天看到不同完成度造成的劇情差異

如果這五件事成立，表示核心玩法已經成形。

## 6. 後續擴充

第二版再加入：

- 第二週流程
- 惠那與葵 checklist
- 更多商店分類
- 料理小遊戲
- 分歧存檔
- 簡易角色立繪占位

## 7. 目前 Prototype 已實作狀態

截至目前版本，prototype 已從第一週垂直切片擴充為「五人第一週入口 + 第二週短流程」。

已實作內容：

- 五位角色第一週入口：凜、撫子、千明、葵、惠那都能在第一週產生 checklist 與傾向值
- 第二週短流程：依第一週主要傾向進入角色 LINE 導入、三次準備行動、週末短結算
- 商店分類保底：會優先出現未完成 checklist 所需分類，避免因隨機造成死局
- Build / Combo 預覽：商店物品會顯示買下後接近或啟動的 Build
- 背包 Build 面板：右側顯示已啟動 Build 與差一類可完成的 Build
- Build 劇情回饋：露營結算會依已啟動 Build 追加對應劇情段落
- 路線進度面板：顯示目前最接近角色與五位角色的路線分數
- 物品生命週期：消耗品與票券會在進入下一週時清理，裝備會保留；平日可賣出物品回收 50% 預算
- 存檔版本：存檔包含 `saveVersion`，讀檔時會補齊新版本需要的欄位

目前 Build 條件仍採「必要標籤」形式，不要求指定物品。例如 `保暖 + 熱飲` 會啟動「冬露舒適」，任何同類物品都可成立。

下一階段適合補強：

- 第二週每條角色線的劇情厚度
- 第三週前的正式路線鎖定
- 更完整的結算畫面與下一週預告
- 料理、搭營或拍照等小遊戲
