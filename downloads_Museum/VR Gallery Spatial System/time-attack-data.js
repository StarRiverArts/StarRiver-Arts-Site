/* Time Attack data — model mirrors StarRiverVRCInfo:
   group (family bucket) → track_variant → track_route; records carry
   driver / vehicle / lap_time / platform / fps / date.
   Badges (TR>CR>PR) are computed per-route at runtime (see ta-core.js).

   ~62 sample variants across 5 families to exercise browsing at scale.
   Production catalogue is ~60 tracks — same shape, just more rows. */
window.TA_DATA = {
  groups: ["北部山道 North", "中部山道 Central", "東部山道 East", "南部山道 South", "虛構場景 Fiction"],
  variants: [
    /* ---------- 北部山道 North ---------- */
    {
      id: "9turns", group: "北部山道 North", fam: "台9 · 北宜 Beiyi", name: "九彎十八拐 9 Turns",
      sign: "9", signSub: "省道", signColor: "#1E6B3E",
      routes: [
        { id: "9t_dh", name: "下山 Downhill", dist: "9.2 km", records: [
          { driver: "AKINA_8686", vehicle: "AE86 Trueno", ms: 232418, plat: "PCVR",    fps: 144, date: "2026-05-22" },
          { driver: "Ryo_FC3S",   vehicle: "RX-7 FD",     ms: 233002, plat: "PCVR",    fps: 120, date: "2026-05-21" },
          { driver: "雷神Raijin",  vehicle: "EVO IX",      ms: 233770, plat: "PCVR",    fps: 144, date: "2026-05-19" },
          { driver: "白稜Shiro",    vehicle: "S15 Silvia",  ms: 235140, plat: "Desktop", fps: 60,  date: "2026-05-12" },
          { driver: "AKINA_8686", vehicle: "RX-7 FD",     ms: 235980, plat: "PCVR",    fps: 144, date: "2026-05-08" },
          { driver: "Momo_GR",    vehicle: "GR86",        ms: 237610, plat: "PCVR",    fps: 120, date: "2026-05-15" },
          { driver: "K.Tanaka",   vehicle: "EK9 Civic",   ms: 238330, plat: "Desktop", fps: 90,  date: "2026-04-29" }
        ]},
        { id: "9t_uh", name: "上山 Uphill", dist: "9.2 km", records: [
          { driver: "雷神Raijin",  vehicle: "EVO IX",      ms: 248250, plat: "PCVR",    fps: 144, date: "2026-05-20" },
          { driver: "Ryo_FC3S",   vehicle: "RX-7 FD",     ms: 249910, plat: "PCVR",    fps: 120, date: "2026-05-18" },
          { driver: "Momo_GR",    vehicle: "GR86",        ms: 251400, plat: "PCVR",    fps: 120, date: "2026-05-14" },
          { driver: "AKINA_8686", vehicle: "AE86 Trueno", ms: 252880, plat: "PCVR",    fps: 144, date: "2026-05-09" }
        ]}
      ]
    },
    { id: "balaka", group: "北部山道 North", fam: "台2甲 · 陽明山 Yangmingshan", name: "巴拉卡 Balaka",
      sign: "2甲", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "bl_dh", name: "下山 Downhill", dist: "7.4 km", records: [
          { driver: "白稜Shiro",   vehicle: "S15 Silvia", ms: 191240, plat: "PCVR",    fps: 120, date: "2026-05-17" },
          { driver: "180SX_Koba", vehicle: "180SX",      ms: 192010, plat: "PCVR",    fps: 144, date: "2026-05-13" },
          { driver: "AKINA_8686", vehicle: "AE86 Trueno",ms: 192880, plat: "PCVR",    fps: 144, date: "2026-05-06" },
          { driver: "NightOwl",   vehicle: "S2000",      ms: 194300, plat: "Desktop", fps: 90,  date: "2026-04-28" }
        ]}
      ]
    },
    { id: "beicross", group: "北部山道 North", fam: "台7 · 北橫 North Cross", name: "北橫 North Cross",
      sign: "7", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "bc_run", name: "巴陵段 Baling", dist: "15.6 km", records: [
          { driver: "陳GTR",      vehicle: "Supra A80",  ms: 472600, plat: "PCVR",    fps: 120, date: "2026-05-16" },
          { driver: "雷神Raijin",  vehicle: "EVO IX",     ms: 475180, plat: "PCVR",    fps: 144, date: "2026-05-10" },
          { driver: "K.Tanaka",   vehicle: "WRX STI",    ms: 478950, plat: "PCVR",    fps: 120, date: "2026-05-03" }
        ]}
      ]
    },
    { id: "fengguei", group: "北部山道 North", fam: "北28 · 台北 Taipei", name: "風櫃嘴 Fengguei",
      sign: "北28", signSub: "縣道", signColor: "#7C6238", routes: [
        { id: "fg_up", name: "五指山進 Climb", dist: "5.1 km", records: [
          { driver: "Momo_GR",    vehicle: "GR86",       ms: 131420, plat: "PCVR",    fps: 120, date: "2026-05-19" },
          { driver: "葉山Hayama",  vehicle: "NSX-R",      ms: 132050, plat: "Desktop", fps: 90,  date: "2026-05-11" },
          { driver: "阿維Avi",     vehicle: "Integra DC2",ms: 133600, plat: "PCVR",    fps: 144, date: "2026-05-04" },
          { driver: "白稜Shiro",    vehicle: "S15 Silvia", ms: 134210, plat: "Desktop", fps: 60,  date: "2026-04-27" }
        ]}
      ]
    },
    { id: "wuzhi", group: "北部山道 North", fam: "新竹 Hsinchu", name: "五指山 Wuzhi Mt.",
      sign: "竹", signSub: "產道", signColor: "#7C6238", routes: [
        { id: "wz_run", name: "單圈 Lap", dist: "8.0 km", records: [
          { driver: "阿維Avi",     vehicle: "Integra DC2",ms: 205900, plat: "PCVR",    fps: 144, date: "2026-05-15" },
          { driver: "K.Tanaka",   vehicle: "EK9 Civic",  ms: 206840, plat: "Desktop", fps: 90,  date: "2026-05-07" }
        ]}
      ]
    },

    /* ---------- 中部山道 Central ---------- */
    { id: "wuling", group: "中部山道 Central", fam: "台14甲 · 合歡 Hehuan", name: "武嶺 Wuling",
      sign: "14甲", signSub: "省道", signColor: "#1F5EA8", routes: [
        { id: "wl_climb", name: "西進 Climb", dist: "13.1 km", records: [
          { driver: "雷神Raijin",  vehicle: "EVO IX",     ms: 401560, plat: "PCVR",    fps: 144, date: "2026-05-23" },
          { driver: "K.Tanaka",   vehicle: "WRX STI",    ms: 403120, plat: "PCVR",    fps: 120, date: "2026-05-17" },
          { driver: "白稜Shiro",    vehicle: "EVO IX",     ms: 404900, plat: "Desktop", fps: 60,  date: "2026-05-11" },
          { driver: "Ryo_FC3S",   vehicle: "RX-7 FD",    ms: 406740, plat: "PCVR",    fps: 120, date: "2026-05-06" },
          { driver: "Momo_GR",    vehicle: "GR86",       ms: 409880, plat: "PCVR",    fps: 120, date: "2026-05-02" }
        ]}
      ]
    },
    { id: "dayuling", group: "中部山道 Central", fam: "台8 · 中橫 Central Cross", name: "大禹嶺 Dayuling",
      sign: "8", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "dy_dh", name: "下山 Downhill", dist: "12.3 km", records: [
          { driver: "陳GTR",      vehicle: "Supra A80",  ms: 372400, plat: "PCVR",    fps: 120, date: "2026-05-18" },
          { driver: "雷神Raijin",  vehicle: "EVO IX",     ms: 374050, plat: "PCVR",    fps: 144, date: "2026-05-12" },
          { driver: "Ryo_FC3S",   vehicle: "RX-7 FD",    ms: 376220, plat: "PCVR",    fps: 120, date: "2026-05-05" }
        ]}
      ]
    },
    { id: "lixing", group: "中部山道 Central", fam: "投89 · 力行 Lixing", name: "力行產業道 Lixing",
      sign: "投89", signSub: "鄉道", signColor: "#7C6238", routes: [
        { id: "lx_run", name: "全段 Full", dist: "18.9 km", records: [
          { driver: "K.Tanaka",   vehicle: "WRX STI",    ms: 612300, plat: "PCVR",    fps: 120, date: "2026-05-14" },
          { driver: "陳GTR",      vehicle: "Supra A80",  ms: 618700, plat: "PCVR",    fps: 120, date: "2026-05-08" }
        ]}
      ]
    },
    { id: "guguan", group: "中部山道 Central", fam: "台8 · 谷關 Guguan", name: "谷關 Guguan",
      sign: "8", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "gg_up", name: "上山 Uphill", dist: "10.7 km", records: [
          { driver: "Momo_GR",    vehicle: "GR86",       ms: 318600, plat: "PCVR",    fps: 120, date: "2026-05-16" },
          { driver: "葉山Hayama",  vehicle: "NSX-R",      ms: 320100, plat: "Desktop", fps: 90,  date: "2026-05-09" },
          { driver: "AKINA_8686", vehicle: "AE86 Trueno",ms: 322750, plat: "PCVR",    fps: 144, date: "2026-05-01" }
        ]}
      ]
    },

    /* ---------- 東部山道 East ---------- */
    { id: "taroko", group: "東部山道 East", fam: "台8 · 太魯閣 Taroko", name: "太魯閣 Taroko",
      sign: "8", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "tk_dh", name: "下山 Downhill", dist: "11.4 km", records: [
          { driver: "Ryo_FC3S",   vehicle: "RX-7 FD",    ms: 322600, plat: "PCVR",    fps: 120, date: "2026-05-19" },
          { driver: "雷神Raijin",  vehicle: "EVO IX",     ms: 324050, plat: "PCVR",    fps: 144, date: "2026-05-15" },
          { driver: "K.Tanaka",   vehicle: "WRX STI",    ms: 326880, plat: "PCVR",    fps: 120, date: "2026-05-07" }
        ]},
        { id: "tk_uh", name: "上山 Uphill", dist: "11.4 km", records: [] }
      ]
    },
    { id: "suhua", group: "東部山道 East", fam: "台9 · 蘇花 Suhua", name: "蘇花 Suhua",
      sign: "9", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "sh_run", name: "清水段 Qingshui", dist: "14.2 km", records: [
          { driver: "陳GTR",      vehicle: "Supra A80",  ms: 431200, plat: "PCVR",    fps: 120, date: "2026-05-13" },
          { driver: "NightOwl",   vehicle: "S2000",      ms: 434600, plat: "Desktop", fps: 90,  date: "2026-05-06" },
          { driver: "白稜Shiro",    vehicle: "S15 Silvia", ms: 436900, plat: "Desktop", fps: 60,  date: "2026-04-30" }
        ]}
      ]
    },
    { id: "coast11", group: "東部山道 East", fam: "台11 · 海岸 Coast", name: "台11 海岸線",
      sign: "11", signSub: "省道", signColor: "#1F5EA8", routes: [
        { id: "c11_run", name: "石梯坪段 Shitiping", dist: "9.8 km", records: [
          { driver: "葉山Hayama",  vehicle: "NSX-R",      ms: 268400, plat: "PCVR",    fps: 120, date: "2026-05-10" },
          { driver: "Momo_GR",    vehicle: "GR86",       ms: 270150, plat: "PCVR",    fps: 120, date: "2026-05-03" }
        ]}
      ]
    },

    /* ---------- 南部山道 South ---------- */
    { id: "alishan", group: "南部山道 South", fam: "台18 · 阿里山 Alishan", name: "阿里山 Alishan",
      sign: "18", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "al_up", name: "上山 Climb", dist: "16.1 km", records: [
          { driver: "雷神Raijin",  vehicle: "EVO IX",     ms: 489300, plat: "PCVR",    fps: 144, date: "2026-05-17" },
          { driver: "K.Tanaka",   vehicle: "WRX STI",    ms: 492700, plat: "PCVR",    fps: 120, date: "2026-05-11" },
          { driver: "陳GTR",      vehicle: "Supra A80",  ms: 495400, plat: "PCVR",    fps: 120, date: "2026-05-04" }
        ]}
      ]
    },
    { id: "tataka", group: "南部山道 South", fam: "台18 · 新中橫 Tataka", name: "塔塔加 Tataka",
      sign: "18", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "tt_run", name: "單圈 Lap", dist: "13.7 km", records: [
          { driver: "陳GTR",      vehicle: "Supra A80",  ms: 408900, plat: "PCVR",    fps: 120, date: "2026-05-12" },
          { driver: "Momo_GR",    vehicle: "GR86",       ms: 412300, plat: "PCVR",    fps: 120, date: "2026-05-05" }
        ]}
      ]
    },
    { id: "nancross", group: "南部山道 South", fam: "台20 · 南橫 South Cross", name: "南橫 South Cross",
      sign: "20", signSub: "省道", signColor: "#1F5EA8", routes: [
        { id: "nc_run", name: "埡口段 Yakou", dist: "17.3 km", records: [] }
      ]
    },

    /* ---------- 虛構場景 Fiction ---------- */
    { id: "starsight", group: "虛構場景 Fiction", fam: "Project T · 虛構", name: "觀星山 StarSight Mt.",
      sign: "T", signSub: "場景", signColor: "#2F4F3A", routes: [
        { id: "ss_lap", name: "單圈 Full Lap", dist: "6.8 km", records: [
          { driver: "Momo_GR",    vehicle: "GR86",       ms: 178900, plat: "PCVR",    fps: 120, date: "2026-05-24" },
          { driver: "AKINA_8686", vehicle: "AE86 Trueno",ms: 179420, plat: "PCVR",    fps: 144, date: "2026-05-22" },
          { driver: "Ryo_FC3S",   vehicle: "RX-7 FD",    ms: 180050, plat: "PCVR",    fps: 120, date: "2026-05-20" },
          { driver: "雷神Raijin",  vehicle: "EVO IX",     ms: 181260, plat: "PCVR",    fps: 144, date: "2026-05-16" },
          { driver: "葉山Hayama",  vehicle: "NSX-R",      ms: 182740, plat: "Desktop", fps: 90,  date: "2026-05-13" },
          { driver: "白稜Shiro",    vehicle: "S15 Silvia", ms: 184010, plat: "Desktop", fps: 60,  date: "2026-05-05" }
        ]},
        { id: "ss_rev", name: "逆走 Reverse", dist: "6.8 km", records: [
          { driver: "AKINA_8686", vehicle: "AE86 Trueno",ms: 185300, plat: "PCVR",    fps: 144, date: "2026-05-21" },
          { driver: "Momo_GR",    vehicle: "GR86",       ms: 186120, plat: "PCVR",    fps: 120, date: "2026-05-18" },
          { driver: "葉山Hayama",  vehicle: "NSX-R",      ms: 188450, plat: "Desktop", fps: 90,  date: "2026-05-10" }
        ]}
      ]
    },
    { id: "nightport", group: "虛構場景 Fiction", fam: "Project T · 虛構", name: "夜港 Night Harbor",
      sign: "T", signSub: "場景", signColor: "#2F4F3A", routes: [
        { id: "np_run", name: "港區環線 Dock Loop", dist: "5.4 km", records: [
          { driver: "白稜Shiro",    vehicle: "S15 Silvia", ms: 142600, plat: "PCVR",    fps: 120, date: "2026-05-14" },
          { driver: "180SX_Koba", vehicle: "180SX",      ms: 143400, plat: "PCVR",    fps: 144, date: "2026-05-08" },
          { driver: "NightOwl",   vehicle: "S2000",      ms: 144950, plat: "Desktop", fps: 90,  date: "2026-05-02" }
        ]}
      ]
    },
    { id: "skyloop", group: "虛構場景 Fiction", fam: "Project T · 虛構", name: "雲海環線 Sky Loop",
      sign: "T", signSub: "場景", signColor: "#2F4F3A", routes: [
        { id: "sk_run", name: "環線 Loop", dist: "9.6 km", records: [
          { driver: "雷神Raijin",  vehicle: "EVO IX",     ms: 256800, plat: "PCVR",    fps: 144, date: "2026-05-15" },
          { driver: "AKINA_8686", vehicle: "AE86 Trueno",ms: 258300, plat: "PCVR",    fps: 144, date: "2026-05-09" },
          { driver: "Momo_GR",    vehicle: "GR86",       ms: 259700, plat: "PCVR",    fps: 120, date: "2026-05-03" }
        ]}
      ]
    },
    { id: "buyanting", group: "北部山道 North", fam: "102 · 雙溪 Shuangxi", name: "不厭亭 寂寞公路",
      sign: "102", signSub: "縣道", signColor: "#7C6238", routes: [
        { id: "buya_0", name: "北上 North", dist: "9.0 km", records: [
          { driver: "白稜Shiro", vehicle: "Supra A80", ms: 230473, plat: "PCVR", fps: 120, date: "2026-04-07" },
          { driver: "Momo_GR", vehicle: "180SX", ms: 254164, plat: "Desktop", fps: 60, date: "2026-05-28" }
        ] },
        { id: "buya_1", name: "南下 South", dist: "13.0 km", records: [] }
      ]
    },
    { id: "wufenshan", group: "北部山道 North", fam: "106 · 平溪 Pingxi", name: "五分山",
      sign: "106", signSub: "縣道", signColor: "#7C6238", routes: [
        { id: "wufe_0", name: "稜線 Ridge", dist: "4.9 km", records: [
          { driver: "黑羽Kuro", vehicle: "MX-5 NA", ms: 126821, plat: "PCVR", fps: 120, date: "2026-05-17" },
          { driver: "AKINA_8686", vehicle: "Skyline R32", ms: 132810, plat: "Desktop", fps: 72, date: "2026-05-28" },
          { driver: "峰Mine", vehicle: "Skyline R32", ms: 133109, plat: "Desktop", fps: 60, date: "2026-05-20" },
          { driver: "DriftKing_Wu", vehicle: "Integra DC2", ms: 138019, plat: "PCVR", fps: 120, date: "2026-05-07" }
        ] }
      ]
    },
    { id: "tonghou", group: "北部山道 North", fam: "北107 · 烏來 Wulai", name: "桶後越嶺",
      sign: "北107", signSub: "鄉道", signColor: "#7C6238", routes: [
        { id: "tong_0", name: "進 In", dist: "13.8 km", records: [
          { driver: "雷神Raijin", vehicle: "S15 Silvia", ms: 355518, plat: "Desktop", fps: 90, date: "2026-05-05" },
          { driver: "葉山Hayama", vehicle: "Lancer Evo VI", ms: 377136, plat: "PCVR", fps: 120, date: "2026-04-17" },
          { driver: "黑羽Kuro", vehicle: "EK9 Civic", ms: 384320, plat: "PCVR", fps: 120, date: "2026-05-10" }
        ] }
      ]
    },
    { id: "beiyiold", group: "北部山道 North", fam: "台9 · 北宜 Beiyi", name: "北宜舊道",
      sign: "9", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "beiy_0", name: "下山 Downhill", dist: "12.2 km", records: [
          { driver: "白稜Shiro", vehicle: "WRX STI", ms: 322824, plat: "PCVR", fps: 144, date: "2026-04-06" },
          { driver: "K.Tanaka", vehicle: "NSX-R", ms: 331399, plat: "Desktop", fps: 72, date: "2026-05-20" },
          { driver: "阿維Avi", vehicle: "Civic EG6", ms: 313441, plat: "Desktop", fps: 90, date: "2026-04-18" },
          { driver: "DriftKing_Wu", vehicle: "GR86", ms: 326794, plat: "PCVR", fps: 144, date: "2026-04-27" }
        ] }
      ]
    },
    { id: "zhuhang", group: "北部山道 North", fam: "台2甲 · 陽明山 Yangmingshan", name: "助航站",
      sign: "2甲", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "zhuh_0", name: "上山 Uphill", dist: "13.8 km", records: [
          { driver: "DriftKing_Wu", vehicle: "Lancer Evo VI", ms: 353292, plat: "Desktop", fps: 60, date: "2026-04-01" },
          { driver: "林Sasaki", vehicle: "R34 GT-R", ms: 385723, plat: "Desktop", fps: 72, date: "2026-04-27" }
        ] }
      ]
    },
    { id: "smangus", group: "北部山道 North", fam: "竹60 · 尖石 Jianshi", name: "司馬庫斯",
      sign: "竹60", signSub: "鄉道", signColor: "#7C6238", routes: [
        { id: "sman_0", name: "全段 Full", dist: "6.1 km", records: [] }
      ]
    },
    { id: "taoyuangu", group: "北部山道 North", fam: "草嶺 · 貢寮 Gongliao", name: "桃源谷",
      sign: "草嶺", signSub: "步道線", signColor: "#2F4F3A", routes: [
        { id: "taoy_0", name: "環線 Loop", dist: "14.3 km", records: [
          { driver: "葉山Hayama", vehicle: "WRX STI", ms: 367207, plat: "Desktop", fps: 72, date: "2026-05-23" },
          { driver: "Momo_GR", vehicle: "NSX-R", ms: 397557, plat: "Desktop", fps: 60, date: "2026-04-18" },
          { driver: "AKINA_8686", vehicle: "WRX STI", ms: 372687, plat: "Desktop", fps: 60, date: "2026-05-16" },
          { driver: "白稜Shiro", vehicle: "RX-7 FD", ms: 377412, plat: "PCVR", fps: 144, date: "2026-05-06" },
          { driver: "DriftKing_Wu", vehicle: "NSX-R", ms: 370911, plat: "PCVR", fps: 120, date: "2026-05-26" },
          { driver: "陳GTR", vehicle: "Skyline R32", ms: 385809, plat: "Desktop", fps: 60, date: "2026-04-13" }
        ] }
      ]
    },
    { id: "shiding", group: "北部山道 North", fam: "106 · 石碇 Shiding", name: "石碇雙溪",
      sign: "106", signSub: "縣道", signColor: "#7C6238", routes: [
        { id: "shid_0", name: "全段 Full", dist: "15.9 km", records: [
          { driver: "K.Tanaka", vehicle: "GR86", ms: 420412, plat: "PCVR", fps: 144, date: "2026-04-06" },
          { driver: "阿維Avi", vehicle: "Lancer Evo VI", ms: 439392, plat: "Desktop", fps: 90, date: "2026-05-13" }
        ] }
      ]
    },
    { id: "jinguazhao", group: "北部山道 North", fam: "北42 · 坪林 Pinglin", name: "金瓜寮",
      sign: "北42", signSub: "鄉道", signColor: "#7C6238", routes: [
        { id: "jing_0", name: "溪線 Creek", dist: "9.1 km", records: [
          { driver: "Momo_GR", vehicle: "180SX", ms: 246534, plat: "PCVR", fps: 120, date: "2026-04-07" },
          { driver: "180SX_Koba", vehicle: "R34 GT-R", ms: 240428, plat: "PCVR", fps: 120, date: "2026-04-02" }
        ] }
      ]
    },
    { id: "bafu", group: "北部山道 North", fam: "桃116 · 復興 Fuxing", name: "巴福越嶺",
      sign: "桃116", signSub: "鄉道", signColor: "#7C6238", routes: [
        { id: "bafu_0", name: "越嶺 Pass", dist: "13.8 km", records: [
          { driver: "AKINA_8686", vehicle: "Lancer Evo VI", ms: 360610, plat: "Desktop", fps: 72, date: "2026-05-14" },
          { driver: "陳GTR", vehicle: "Supra A80", ms: 373412, plat: "Desktop", fps: 90, date: "2026-05-01" }
        ] }
      ]
    },
    { id: "wanlijiatou", group: "北部山道 North", fam: "北28 · 萬里 Wanli", name: "萬里加投",
      sign: "北28", signSub: "縣道", signColor: "#7C6238", routes: [
        { id: "wanl_0", name: "下山 Downhill", dist: "9.7 km", records: [] }
      ]
    },
    { id: "hongludi", group: "北部山道 North", fam: "中和 · 南勢角 Nanshijiao", name: "烘爐地",
      sign: "北", signSub: "產道", signColor: "#2F4F3A", routes: [
        { id: "hong_0", name: "夜爬 Night", dist: "8.9 km", records: [
          { driver: "K.Tanaka", vehicle: "Supra A80", ms: 236754, plat: "PCVR", fps: 120, date: "2026-04-14" },
          { driver: "Ryo_FC3S", vehicle: "GR86", ms: 233581, plat: "PCVR", fps: 120, date: "2026-05-03" },
          { driver: "林Sasaki", vehicle: "MX-5 NA", ms: 244062, plat: "Desktop", fps: 60, date: "2026-04-17" },
          { driver: "陳GTR", vehicle: "Lancer Evo VI", ms: 242433, plat: "PCVR", fps: 144, date: "2026-04-15" },
          { driver: "DriftKing_Wu", vehicle: "WRX STI", ms: 249420, plat: "PCVR", fps: 144, date: "2026-04-18" }
        ] }
      ]
    },
    { id: "cingjing", group: "中部山道 Central", fam: "台14甲 · 合歡 Hehuan", name: "清境翠峰",
      sign: "14甲", signSub: "省道", signColor: "#1F5EA8", routes: [
        { id: "cing_0", name: "上行 Climb", dist: "8.5 km", records: [
          { driver: "黑羽Kuro", vehicle: "GR86", ms: 217208, plat: "PCVR", fps: 144, date: "2026-05-03" },
          { driver: "白稜Shiro", vehicle: "GR86", ms: 230163, plat: "PCVR", fps: 120, date: "2026-05-25" },
          { driver: "Nora_R34", vehicle: "180SX", ms: 221150, plat: "PCVR", fps: 144, date: "2026-04-01" }
        ] }
      ]
    },
    { id: "daxueshan", group: "中部山道 Central", fam: "東勢林道 · 和平 Heping", name: "大雪山",
      sign: "大雪山", signSub: "林道", signColor: "#2F4F3A", routes: [
        { id: "daxu_0", name: "林道 Forest", dist: "9.6 km", records: [
          { driver: "NightOwl", vehicle: "MX-5 NA", ms: 245729, plat: "PCVR", fps: 144, date: "2026-05-12" },
          { driver: "Momo_GR", vehicle: "NSX-R", ms: 253066, plat: "Desktop", fps: 72, date: "2026-05-04" },
          { driver: "AKINA_8686", vehicle: "AE86 Trueno", ms: 269780, plat: "PCVR", fps: 120, date: "2026-05-18" },
          { driver: "Ryo_FC3S", vehicle: "R34 GT-R", ms: 250687, plat: "Desktop", fps: 60, date: "2026-04-24" },
          { driver: "陳GTR", vehicle: "WRX STI", ms: 266118, plat: "PCVR", fps: 120, date: "2026-05-27" },
          { driver: "黑羽Kuro", vehicle: "S15 Silvia", ms: 252630, plat: "PCVR", fps: 120, date: "2026-04-02" }
        ] }
      ]
    },
    { id: "yuanfeng", group: "中部山道 Central", fam: "台14甲 · 合歡 Hehuan", name: "鳶峰",
      sign: "14甲", signSub: "省道", signColor: "#1F5EA8", routes: [
        { id: "yuan_0", name: "觀星段 Stargaze", dist: "6.3 km", records: [
          { driver: "DriftKing_Wu", vehicle: "NSX-R", ms: 174970, plat: "Desktop", fps: 60, date: "2026-05-17" },
          { driver: "Momo_GR", vehicle: "Civic EG6", ms: 174038, plat: "PCVR", fps: 120, date: "2026-04-22" },
          { driver: "白稜Shiro", vehicle: "EK9 Civic", ms: 172179, plat: "PCVR", fps: 144, date: "2026-05-19" },
          { driver: "阿維Avi", vehicle: "EK9 Civic", ms: 168338, plat: "PCVR", fps: 120, date: "2026-05-08" }
        ] }
      ]
    },
    { id: "shanlinxi", group: "中部山道 Central", fam: "投149 · 鹿谷 Lugu", name: "杉林溪",
      sign: "投149", signSub: "鄉道", signColor: "#7C6238", routes: [
        { id: "shan_0", name: "上山 Uphill", dist: "16.5 km", records: [
          { driver: "Momo_GR", vehicle: "MX-5 NA", ms: 456034, plat: "PCVR", fps: 144, date: "2026-05-20" },
          { driver: "NightOwl", vehicle: "180SX", ms: 423225, plat: "Desktop", fps: 90, date: "2026-04-01" },
          { driver: "Ryo_FC3S", vehicle: "S15 Silvia", ms: 462802, plat: "PCVR", fps: 120, date: "2026-05-31" },
          { driver: "AKINA_8686", vehicle: "Supra A80", ms: 434694, plat: "PCVR", fps: 144, date: "2026-04-17" }
        ] }
      ]
    },
    { id: "caoling", group: "中部山道 Central", fam: "149甲 · 古坑 Gukeng", name: "草嶺石壁",
      sign: "149甲", signSub: "縣道", signColor: "#7C6238", routes: [
        { id: "caol_0", name: "全段 Full", dist: "14.7 km", records: [
          { driver: "葉山Hayama", vehicle: "EVO IX", ms: 394008, plat: "Desktop", fps: 90, date: "2026-04-20" },
          { driver: "小傑Jay", vehicle: "180SX", ms: 409483, plat: "Desktop", fps: 60, date: "2026-05-12" },
          { driver: "雷神Raijin", vehicle: "WRX STI", ms: 393973, plat: "Desktop", fps: 60, date: "2026-05-08" }
        ] }
      ]
    },
    { id: "baguashan", group: "中部山道 Central", fam: "139 · 彰化 Changhua", name: "八卦山",
      sign: "139", signSub: "縣道", signColor: "#7C6238", routes: [
        { id: "bagu_0", name: "稜線 Ridge", dist: "9.2 km", records: [
          { driver: "NightOwl", vehicle: "WRX STI", ms: 242804, plat: "Desktop", fps: 60, date: "2026-04-07" }
        ] }
      ]
    },
    { id: "dayan", group: "中部山道 Central", fam: "投49 · 竹山 Zhushan", name: "大鞍",
      sign: "投49", signSub: "鄉道", signColor: "#7C6238", routes: [
        { id: "daya_0", name: "下山 Downhill", dist: "7.7 km", records: [
          { driver: "小傑Jay", vehicle: "Integra DC2", ms: 206738, plat: "Desktop", fps: 72, date: "2026-04-16" },
          { driver: "Nora_R34", vehicle: "NSX-R", ms: 204838, plat: "PCVR", fps: 120, date: "2026-05-19" },
          { driver: "林Sasaki", vehicle: "Integra DC2", ms: 204868, plat: "Desktop", fps: 72, date: "2026-04-25" }
        ] }
      ]
    },
    { id: "shuangqi", group: "中部山道 Central", fam: "中47 · 和平 Heping", name: "雙崎",
      sign: "中47", signSub: "鄉道", signColor: "#7C6238", routes: [
        { id: "shua_0", name: "產線 Track", dist: "15.0 km", records: [
          { driver: "K.Tanaka", vehicle: "S15 Silvia", ms: 401535, plat: "PCVR", fps: 120, date: "2026-05-14" },
          { driver: "Ryo_FC3S", vehicle: "EVO IX", ms: 392804, plat: "PCVR", fps: 120, date: "2026-04-07" },
          { driver: "阿維Avi", vehicle: "Lancer Evo VI", ms: 393838, plat: "Desktop", fps: 90, date: "2026-04-17" },
          { driver: "林Sasaki", vehicle: "WRX STI", ms: 417149, plat: "Desktop", fps: 60, date: "2026-05-24" }
        ] }
      ]
    },
    { id: "cuiluan", group: "中部山道 Central", fam: "投83 · 仁愛 Ren'ai", name: "翠巒",
      sign: "投83", signSub: "鄉道", signColor: "#7C6238", routes: [
        { id: "cuil_0", name: "全段 Full", dist: "7.0 km", records: [
          { driver: "阿維Avi", vehicle: "EVO IX", ms: 183651, plat: "Desktop", fps: 90, date: "2026-05-10" },
          { driver: "Momo_GR", vehicle: "180SX", ms: 196825, plat: "Desktop", fps: 60, date: "2026-05-03" },
          { driver: "白稜Shiro", vehicle: "Lancer Evo VI", ms: 184526, plat: "Desktop", fps: 90, date: "2026-05-13" }
        ] }
      ]
    },
    { id: "erjian", group: "中部山道 Central", fam: "嘉154 · 梅山 Meishan", name: "二尖",
      sign: "嘉154", signSub: "鄉道", signColor: "#7C6238", routes: [
        { id: "erji_0", name: "環線 Loop", dist: "15.3 km", records: [
          { driver: "Ryo_FC3S", vehicle: "Skyline R32", ms: 414896, plat: "Desktop", fps: 90, date: "2026-05-11" }
        ] }
      ]
    },
    { id: "yuchang", group: "東部山道 East", fam: "台30 · 玉里 Yuli", name: "玉長公路",
      sign: "30", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "yuch_0", name: "東行 East", dist: "7.1 km", records: [
          { driver: "陳GTR", vehicle: "180SX", ms: 187036, plat: "Desktop", fps: 90, date: "2026-05-29" },
          { driver: "雷神Raijin", vehicle: "180SX", ms: 191508, plat: "PCVR", fps: 120, date: "2026-05-11" },
          { driver: "NightOwl", vehicle: "EVO IX", ms: 200690, plat: "PCVR", fps: 144, date: "2026-04-24" },
          { driver: "黑羽Kuro", vehicle: "AE86 Trueno", ms: 193447, plat: "PCVR", fps: 120, date: "2026-05-09" },
          { driver: "林Sasaki", vehicle: "WRX STI", ms: 185333, plat: "Desktop", fps: 90, date: "2026-04-21" }
        ] }
      ]
    },
    { id: "chishang", group: "東部山道 East", fam: "197 · 池上 Chishang", name: "池上富里",
      sign: "197", signSub: "縣道", signColor: "#7C6238", routes: [
        { id: "chis_0", name: "縱線 Valley", dist: "7.1 km", records: [
          { driver: "雷神Raijin", vehicle: "NSX-R", ms: 197753, plat: "PCVR", fps: 120, date: "2026-04-09" },
          { driver: "Momo_GR", vehicle: "180SX", ms: 193533, plat: "Desktop", fps: 90, date: "2026-04-26" },
          { driver: "峰Mine", vehicle: "180SX", ms: 197574, plat: "PCVR", fps: 120, date: "2026-05-31" },
          { driver: "黑羽Kuro", vehicle: "Lancer Evo VI", ms: 197443, plat: "PCVR", fps: 120, date: "2026-05-23" }
        ] }
      ]
    },
    { id: "ruisui", group: "東部山道 East", fam: "台9 · 瑞穗 Ruisui", name: "瑞穗富源",
      sign: "9", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "ruis_0", name: "河階段 Terrace", dist: "17.5 km", records: [] }
      ]
    },
    { id: "lintianshan", group: "東部山道 East", fam: "台16 · 鳳林 Fenglin", name: "林田山",
      sign: "16", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "lint_0", name: "林場線 Mill", dist: "13.6 km", records: [
          { driver: "小傑Jay", vehicle: "Integra DC2", ms: 355581, plat: "Desktop", fps: 60, date: "2026-04-05" },
          { driver: "Ryo_FC3S", vehicle: "Supra A80", ms: 349304, plat: "Desktop", fps: 90, date: "2026-04-14" },
          { driver: "林Sasaki", vehicle: "RX-7 FD", ms: 355824, plat: "Desktop", fps: 90, date: "2026-04-27" },
          { driver: "Momo_GR", vehicle: "EVO IX", ms: 358346, plat: "PCVR", fps: 120, date: "2026-04-25" }
        ] }
      ]
    },
    { id: "liyutan", group: "東部山道 East", fam: "台9甲 · 壽豐 Shoufeng", name: "鯉魚潭",
      sign: "9甲", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "liyu_0", name: "環潭 Lake", dist: "11.2 km", records: [
          { driver: "K.Tanaka", vehicle: "NSX-R", ms: 285601, plat: "Desktop", fps: 90, date: "2026-04-25" }
        ] }
      ]
    },
    { id: "guangfu", group: "東部山道 East", fam: "193 · 光復 Guangfu", name: "光復大農",
      sign: "193", signSub: "縣道", signColor: "#7C6238", routes: [
        { id: "guan_0", name: "山線 Hill", dist: "17.8 km", records: [
          { driver: "180SX_Koba", vehicle: "EK9 Civic", ms: 461556, plat: "PCVR", fps: 144, date: "2026-04-01" },
          { driver: "白稜Shiro", vehicle: "Civic EG6", ms: 461104, plat: "PCVR", fps: 144, date: "2026-04-31" }
        ] }
      ]
    },
    { id: "emudan", group: "東部山道 East", fam: "199 · 牡丹 Mudan", name: "牡丹旭海",
      sign: "199", signSub: "縣道", signColor: "#7C6238", routes: [
        { id: "emud_0", name: "越嶺 Pass", dist: "9.5 km", records: [
          { driver: "180SX_Koba", vehicle: "Supra A80", ms: 244313, plat: "Desktop", fps: 60, date: "2026-04-03" },
          { driver: "NightOwl", vehicle: "S15 Silvia", ms: 265490, plat: "PCVR", fps: 120, date: "2026-04-22" }
        ] }
      ]
    },
    { id: "fuli", group: "東部山道 East", fam: "193 · 富里 Fuli", name: "富里東里",
      sign: "193", signSub: "縣道", signColor: "#7C6238", routes: [
        { id: "fuli_0", name: "南段 South", dist: "9.5 km", records: [
          { driver: "林Sasaki", vehicle: "GR86", ms: 245546, plat: "Desktop", fps: 72, date: "2026-04-14" },
          { driver: "阿維Avi", vehicle: "EK9 Civic", ms: 265905, plat: "Desktop", fps: 60, date: "2026-05-12" }
        ] }
      ]
    },
    { id: "wutai", group: "南部山道 South", fam: "台24 · 三地門 Sandimen", name: "霧台",
      sign: "24", signSub: "省道", signColor: "#1F5EA8", routes: [
        { id: "wuta_0", name: "上山 Climb", dist: "7.1 km", records: [
          { driver: "Ryo_FC3S", vehicle: "EVO IX", ms: 192088, plat: "PCVR", fps: 144, date: "2026-04-07" }
        ] }
      ]
    },
    { id: "tengzhi", group: "南部山道 South", fam: "132林道 · 桃源 Taoyuan", name: "藤枝",
      sign: "藤枝", signSub: "林道", signColor: "#2F4F3A", routes: [
        { id: "teng_0", name: "林道 Forest", dist: "11.3 km", records: [
          { driver: "林Sasaki", vehicle: "Civic EG6", ms: 308406, plat: "PCVR", fps: 144, date: "2026-04-30" },
          { driver: "白稜Shiro", vehicle: "S15 Silvia", ms: 312603, plat: "PCVR", fps: 144, date: "2026-05-15" },
          { driver: "Nora_R34", vehicle: "180SX", ms: 295401, plat: "PCVR", fps: 144, date: "2026-04-27" },
          { driver: "DriftKing_Wu", vehicle: "S2000", ms: 306106, plat: "Desktop", fps: 72, date: "2026-05-22" }
        ] }
      ]
    },
    { id: "maolin", group: "南部山道 South", fam: "高132 · 茂林 Maolin", name: "茂林多納",
      sign: "高132", signSub: "鄉道", signColor: "#7C6238", routes: [
        { id: "maol_0", name: "谷線 Gorge", dist: "16.2 km", records: [] }
      ]
    },
    { id: "shouka", group: "南部山道 South", fam: "台9 · 達仁 Daren", name: "壽卡",
      sign: "9", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "shou_0", name: "南迴段 Nanhui", dist: "11.3 km", records: [
          { driver: "DriftKing_Wu", vehicle: "Lancer Evo VI", ms: 300751, plat: "Desktop", fps: 60, date: "2026-04-01" },
          { driver: "陳GTR", vehicle: "Integra DC2", ms: 316687, plat: "Desktop", fps: 60, date: "2026-05-26" },
          { driver: "葉山Hayama", vehicle: "S2000", ms: 311377, plat: "PCVR", fps: 144, date: "2026-04-07" },
          { driver: "NightOwl", vehicle: "EK9 Civic", ms: 310197, plat: "PCVR", fps: 144, date: "2026-05-12" },
          { driver: "Momo_GR", vehicle: "Lancer Evo VI", ms: 308478, plat: "PCVR", fps: 144, date: "2026-05-15" }
        ] }
      ]
    },
    { id: "road199", group: "南部山道 South", fam: "199 · 牡丹 Mudan", name: "199縣道",
      sign: "199", signSub: "縣道", signColor: "#7C6238", routes: [
        { id: "road_0", name: "全段 Full", dist: "14.7 km", records: [
          { driver: "Nora_R34", vehicle: "EK9 Civic", ms: 382233, plat: "PCVR", fps: 120, date: "2026-04-16" },
          { driver: "DriftKing_Wu", vehicle: "R34 GT-R", ms: 379379, plat: "PCVR", fps: 144, date: "2026-05-31" }
        ] }
      ]
    },
    { id: "dawu", group: "南部山道 South", fam: "台9 · 大武 Dawu", name: "大武",
      sign: "9", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "dawu_0", name: "海線 Coast", dist: "15.0 km", records: [
          { driver: "180SX_Koba", vehicle: "EK9 Civic", ms: 410442, plat: "PCVR", fps: 120, date: "2026-04-13" }
        ] }
      ]
    },
    { id: "ruili", group: "南部山道 South", fam: "嘉122 · 梅山 Meishan", name: "瑞里",
      sign: "嘉122", signSub: "縣道", signColor: "#7C6238", routes: [
        { id: "ruil_0", name: "上山 Uphill", dist: "7.7 km", records: [
          { driver: "Nora_R34", vehicle: "R34 GT-R", ms: 209019, plat: "PCVR", fps: 144, date: "2026-04-14" }
        ] }
      ]
    },
    { id: "meishantaiping", group: "南部山道 South", fam: "162甲 · 梅山 Meishan", name: "梅山太平",
      sign: "162甲", signSub: "縣道", signColor: "#7C6238", routes: [
        { id: "meis_0", name: "36彎 36 Bends", dist: "9.5 km", records: [
          { driver: "Ryo_FC3S", vehicle: "Supra A80", ms: 246043, plat: "Desktop", fps: 60, date: "2026-04-09" },
          { driver: "陳GTR", vehicle: "S15 Silvia", ms: 251110, plat: "PCVR", fps: 120, date: "2026-05-21" },
          { driver: "阿維Avi", vehicle: "RX-7 FD", ms: 247325, plat: "Desktop", fps: 60, date: "2026-04-05" },
          { driver: "Nora_R34", vehicle: "S2000", ms: 262139, plat: "Desktop", fps: 60, date: "2026-05-05" }
        ] }
      ]
    },
    { id: "zengwen", group: "南部山道 South", fam: "台3 · 楠西 Nanxi", name: "曾文",
      sign: "3", signSub: "省道", signColor: "#1E6B3E", routes: [
        { id: "zeng_0", name: "水庫線 Reservoir", dist: "6.0 km", records: [
          { driver: "180SX_Koba", vehicle: "R34 GT-R", ms: 162727, plat: "PCVR", fps: 120, date: "2026-05-13" },
          { driver: "Momo_GR", vehicle: "EVO IX", ms: 156793, plat: "PCVR", fps: 120, date: "2026-04-08" },
          { driver: "林Sasaki", vehicle: "NSX-R", ms: 158570, plat: "PCVR", fps: 144, date: "2026-05-03" },
          { driver: "阿維Avi", vehicle: "S2000", ms: 167762, plat: "PCVR", fps: 120, date: "2026-04-17" }
        ] }
      ]
    },
    { id: "galaxybridge", group: "虛構場景 Fiction", fam: "Project T · 虛構", name: "銀河大橋 Galaxy Bridge",
      sign: "T", signSub: "場景", signColor: "#2F4F3A", routes: [
        { id: "gala_0", name: "跨橋 Span", dist: "4.5 km", records: [
          { driver: "葉山Hayama", vehicle: "S15 Silvia", ms: 120081, plat: "PCVR", fps: 120, date: "2026-04-04" },
          { driver: "白稜Shiro", vehicle: "EK9 Civic", ms: 120022, plat: "Desktop", fps: 72, date: "2026-05-04" },
          { driver: "峰Mine", vehicle: "EVO IX", ms: 125919, plat: "Desktop", fps: 72, date: "2026-04-06" }
        ] }
      ]
    },
    { id: "derelictdocks", group: "虛構場景 Fiction", fam: "Project T · 虛構", name: "廢港夜線 Derelict Docks",
      sign: "T", signSub: "場景", signColor: "#2F4F3A", routes: [
        { id: "dere_0", name: "夜線 Night", dist: "4.0 km", records: [] }
      ]
    },
    { id: "skywayloop", group: "虛構場景 Fiction", fam: "Project T · 虛構", name: "高架環線 Skyway Loop",
      sign: "T", signSub: "場景", signColor: "#2F4F3A", routes: [
        { id: "skyw_0", name: "環線 Loop", dist: "14.9 km", records: [
          { driver: "Ryo_FC3S", vehicle: "S2000", ms: 406666, plat: "PCVR", fps: 144, date: "2026-05-18" },
          { driver: "AKINA_8686", vehicle: "NSX-R", ms: 385237, plat: "Desktop", fps: 72, date: "2026-05-12" },
          { driver: "林Sasaki", vehicle: "WRX STI", ms: 397908, plat: "PCVR", fps: 144, date: "2026-05-12" }
        ] }
      ]
    },
    { id: "tunnelrun", group: "虛構場景 Fiction", fam: "Project T · 虛構", name: "隧道競速 Tunnel Run",
      sign: "T", signSub: "場景", signColor: "#2F4F3A", routes: [
        { id: "tunn_0", name: "直線 Sprint", dist: "7.2 km", records: [
          { driver: "NightOwl", vehicle: "RX-7 FD", ms: 202200, plat: "PCVR", fps: 120, date: "2026-04-09" },
          { driver: "AKINA_8686", vehicle: "R34 GT-R", ms: 202966, plat: "Desktop", fps: 90, date: "2026-05-20" }
        ] }
      ]
    }
  ]
};
