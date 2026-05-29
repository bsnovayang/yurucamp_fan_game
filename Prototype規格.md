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

