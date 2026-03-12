export const games = [
  {
    id: 1,
    slug: "reaction-test",
    name: "反應速度測試",
    category: "速度挑戰",
    type: "反應測驗",
    difficulty: "簡單",
    rankingMode: "反應速度分數排名",
    description: "在最短時間內做出反應，挑戰你的手速極限。",
    instructions: [
      "按下開始遊戲後，先等待畫面變色。",
      "只有在畫面變綠後才能立即點擊。",
      "越快做出反應，成績越好。",
      "分數計算方式為 1000 - 您的測試時間"
    ]
  },
  {
    id: 2,
    slug: "catch-items",
    name: "接物品",
    category: "動作反應",
    type: "接取挑戰",
    difficulty: "簡單",
    rankingMode: "最高分排名",
    description: "控制角色接住掉落物品，考驗反應與判斷能力。",
    instructions: [
      "按下開始遊戲後，使用左右方向鍵移動接取板。",
      "接住好物品會加分，接到壞物品會扣分。",
      "漏接好物品會失去生命，生命歸零時遊戲結束。"
    ]
  },
  {
    id: 3,
    slug: "snake",
    name: "貪食蛇",
    category: "經典街機",
    type: "生存成長",
    difficulty: "中等",
    rankingMode: "最高分排名",
    description: "控制蛇持續成長，同時避免撞牆與撞到自己。",
    instructions: [
      "按下開始遊戲後，使用方向鍵控制蛇移動方向。",
      "吃到食物後蛇身會變長並增加分數。",
      "撞到牆壁或自己遊戲就會結束。"
    ]
  },
  {
    id: 4,
    slug: "bee-shooter",
    name: "小蜜蜂",
    category: "射擊街機",
    type: "飛行射擊",
    difficulty: "中等",
    rankingMode: "最高分排名",
    description: "操作飛船閃避敵人並擊敗敵人，取得更高分數。",
    instructions: [
      "使用方向鍵移動飛船。",
      "按下空白鍵發射子彈。",
      "擊敗越多敵人可獲得越高分數。"
    ]
  },
  {
    id: 5,
    slug: "wordle",
    name: "Wordle",
    category: "益智猜字",
    type: "文字推理",
    difficulty: "中等",
    rankingMode: "越少次猜中分數越高",
    description: "在有限次數內猜出正確單字，挑戰你的字彙能力。",
    instructions: [
      "每次輸入 5 個英文字母進行猜測。",
      "綠色代表字母與位置都正確。",
      "黃色代表字母正確但位置錯誤。",
      "灰色代表該字母不在答案中。",
      "在 6 次內猜中答案即可獲勝。"
    ]
  }
]