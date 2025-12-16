"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";

/* eslint-disable @next/next/no-img-element */

/* eslint-disable react-hooks/exhaustive-deps */

const Home: NextPage = () => {
  const linusImages = [
    "/site5-42faac9c-6f2e-4a14-9200-bb397d81271a.webp",
    "/site5-5c0cd3cf-3b3a-4d2e-b277-6240dabf25d9.webp",
    "/site5-67bf14dc-bbd0-4a7e-86f6-abed6fae68e7.webp",
    "/site5-7ac4a4a3-959a-4fbc-ac84-f305cb92b232.webp",
    "/site5-806b04b3-8d4d-4823-8f3c-baeeb8e4c5bc.webp",
    "/site5-9b1f0c38-4b39-44fd-99c6-dfbc73770fed.webp",
    "/site5-9f7b1d53-83d0-441f-9289-ee4eed35b953.webp",
    "/site5-a9224e6e-8384-4739-940c-1914bc32951d.webp",
    "/site5-c7e03a7b-0ee0-4743-891e-cecf150b9882.jpg",
    "/site5-ecfd4851-c951-44b3-bd04-60f9e809cf22.webp",
  ];

  // 自适应图片组件
  const AdaptiveImage = ({
    src,
    alt = "",
    sizes = "260px",
    className = "",
    fixedAspect,
    fit = "contain",
    quality = 85,
    priority = false,
    maxHeight,
  }: {
    src: string;
    alt?: string;
    sizes?: string;
    className?: string;
    fixedAspect?: string;
    fit?: "contain" | "cover";
    quality?: number;
    priority?: boolean;
    maxHeight?: string;
  }) => {
    const [ratio, setRatio] = useState<{ w: number; h: number } | null>(null);
    const aspect = fixedAspect || (ratio ? `${ratio.w} / ${ratio.h}` : "4 / 3");
    return (
      <div className="relative w-full" style={{ aspectRatio: aspect, maxHeight: maxHeight }}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          className={`${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
          onLoad={img => setRatio({ w: img.currentTarget.naturalWidth, h: img.currentTarget.naturalHeight })}
        />
      </div>
    );
  };

  // 动态主色提取
  const useImagePalette = (src: string) => {
    const [color, setColor] = useState<string | null>(null);
    useEffect(() => {
      if (!src || typeof window === "undefined") return;
      const img = new window.Image();
      img.src = src;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, 32, 32);
          const data = ctx.getImageData(0, 0, 32, 32).data;
          let r = 0,
            g = 0,
            b = 0,
            n = 0;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            n++;
          }
          r = Math.round(r / n);
          g = Math.round(g / n);
          b = Math.round(b / n);
          const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
          setColor(hex);
        } catch (e) {
          // palette 提取失败时忽略
        }
      };
    }, [src]);
    return color;
  };

  // 分类数据
  const categories = useMemo(
    () => [
      "英雄",
      "位置",
      "上单",
      "打野",
      "中单",
      "下路",
      "辅助",
      "阵营",
      "德玛西亚",
      "诺克萨斯",
      "艾欧尼亚",
      "皮尔特沃夫",
      "祖安",
      "弗雷尔卓德",
      "班德尔城",
      "暗影岛",
      "恕瑞玛",
      "地图",
      "召唤师峡谷",
      "极地大乱斗",
      "云顶之弈",
      "赛事",
      "战队",
      "皮肤",
      "原画",
    ],
    [],
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const catScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollCategories = (dir: "prev" | "next") => {
    const el = catScrollRef.current;
    if (!el) return;
    const delta = dir === "prev" ? -300 : 300;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  // 作品标签与网格
  const workTags = useMemo(
    () => [
      "全部",
      "上单",
      "打野",
      "中单",
      "下路",
      "辅助",
      "德玛西亚",
      "诺克萨斯",
      "艾欧尼亚",
      "祖安",
      "弗雷尔卓德",
      "恕瑞玛",
    ],
    [],
  );
  const [selectedWorkTag, setSelectedWorkTag] = useState<string>(workTags[0]);
  const [seed, setSeed] = useState(0);

  const shuffle = <T,>(arr: T[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = (i * 9301 + seed * 49297 + 233280) % (i + 1);
      const jj = Math.floor(j);
      [a[i], a[jj]] = [a[jj], a[i]];
    }
    return a;
  };

  type WorkItem = { id: string; img: string; title: string; author: string; like: number; view: number; tag: string };
  const baseWorks: WorkItem[] = useMemo(() => {
    const tagsCycle = [
      "上单",
      "打野",
      "中单",
      "下路",
      "辅助",
      "德玛西亚",
      "诺克萨斯",
      "艾欧尼亚",
      "祖安",
      "弗雷尔卓德",
      "恕瑞玛",
    ];
    return Array.from({ length: 18 }).map((_, i) => ({
      id: `w-${i}`,
      img: linusImages[i % linusImages.length],
      title: `作品 ${i + 1}`,
      author: `作者 ${i + 1}`,
      like: 100 + i * 7,
      view: 800 + i * 13,
      tag: tagsCycle[i % tagsCycle.length],
    }));
  }, [linusImages]);

  const recommendWorks = useMemo(() => shuffle(baseWorks), [baseWorks, seed]);
  const filteredRecommendWorks = useMemo(
    () => (selectedWorkTag === "全部" ? recommendWorks : recommendWorks.filter(w => w.tag === selectedWorkTag)),
    [recommendWorks, selectedWorkTag],
  );
  const refreshRecommendWorks = () => setSeed(s => s + 1);

  const tabs = [
    { key: "recommend", label: "推荐" },
    { key: "follow", label: "关注" },
    { key: "standings", label: "积分" },
    { key: "latest", label: "最新" },
  ] as const;
  const [selectedTab, setSelectedTab] = useState<(typeof tabs)[number]["key"]>("recommend");
  const [standingsLeague, setStandingsLeague] = useState("LCK");
  const [standings, setStandings] = useState<{
    league: { key: string; label: string };
    rankings: { name: string; slug?: string; code?: string; image?: string; wins?: number; losses?: number }[];
  } | null>(null);

  useEffect(() => {
    if (selectedTab !== "standings") return;
    const load = async () => {
      try {
        const res = await fetch(`/api/esports/standings?league=${encodeURIComponent(standingsLeague)}`);
        if (!res.ok) throw new Error("站立取回失败");
        const json = await res.json();
        setStandings(json?.data || null);
      } catch (e) {
        console.warn("排行榜加载失败", e);
      }
    };
    load();
  }, [selectedTab, standingsLeague]);

  const slugifyTeam = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  type TeamInfo = {
    name: string;
    logoSlug?: string;
    url?: string;
    wiki?: string;
    roster?: { role: "上" | "野" | "中" | "下" | "辅"; player: string }[];
  };

  type LeagueInfo = { key: string; label: string; teams: TeamInfo[] };

  const defaultLeagues = useMemo(
    () => [
      {
        key: "LCK",
        label: "LCK",
        teams: [
          {
            name: "T1",
            logoSlug: "t1",
            url: "https://lolesports.com/team/t1",
            wiki: "https://liquipedia.net/leagueoflegends/T1",
            roster: [
              { role: "上", player: "Zeus" },
              { role: "野", player: "Oner" },
              { role: "中", player: "Faker" },
              { role: "下", player: "Gumayusi" },
              { role: "辅", player: "Keria" },
            ],
          },
          { name: "Gen.G", logoSlug: "gen-g", wiki: "https://liquipedia.net/leagueoflegends/Gen.G" },
          { name: "KT Rolster", logoSlug: "kt-rolster", wiki: "https://liquipedia.net/leagueoflegends/KT_Rolster" },
          {
            name: "Hanwha Life Esports",
            logoSlug: "hanwha-life-esports",
            wiki: "https://liquipedia.net/leagueoflegends/Hanwha_Life_Esports",
          },
          { name: "Dplus KIA", logoSlug: "dplus-kia", wiki: "https://liquipedia.net/leagueoflegends/Dplus_KIA" },
        ] as TeamInfo[],
      },
      {
        key: "LPL",
        label: "LPL",
        teams: [
          { name: "JDG", wiki: "https://liquipedia.net/leagueoflegends/JDG_Intel_Esports_Club" },
          { name: "TES", wiki: "https://liquipedia.net/leagueoflegends/Top_Esports" },
          { name: "BLG", wiki: "https://liquipedia.net/leagueoflegends/Bilibili_Gaming" },
          { name: "LNG", wiki: "https://liquipedia.net/leagueoflegends/LNG_Esports" },
          { name: "EDG", wiki: "https://liquipedia.net/leagueoflegends/EDward_Gaming" },
        ] as TeamInfo[],
      },
      // ... 其他赛区数据可按需添加，为缩减文件大小暂略
    ],
    [],
  );

  const [remoteLeagues, setRemoteLeagues] = useState<LeagueInfo[] | null>(null);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/esports/leagues");
        if (!res.ok) throw new Error("fetch leagues failed");
        const json = await res.json();
        const data = (json?.data || []) as LeagueInfo[];
        if (Array.isArray(data) && data.length > 0) setRemoteLeagues(data);
      } catch (err) {
        console.warn("电竞联赛加载失败", err);
      }
    };
    load();
  }, []);

  const [standingsByLeague, setStandingsByLeague] = useState<
    Record<string, Record<string, { wins?: number; losses?: number }>>
  >({});
  const [nextMatchByLeague, setNextMatchByLeague] = useState<
    Record<string, Record<string, { opponent: string; startTime: string }>>
  >({});
  const [rostersByLeague, setRostersByLeague] = useState<
    Record<string, Record<string, { role: "上" | "野" | "中" | "下" | "辅"; player: string }[]>>
  >({});
  const [rosterSubsByLeague, setRosterSubsByLeague] = useState<Record<string, Record<string, string[]>>>({});
  console.log("rosterSubsByLeague", rosterSubsByLeague);
  useEffect(() => {
    if (selectedTab !== "follow") return;
    const leaguesToLoad = (remoteLeagues ?? defaultLeagues).map(l => l.key);
    const unique = Array.from(new Set(leaguesToLoad));
    Promise.all(
      unique.map(async leagueKey => {
        try {
          const [sRes, mRes, rRes] = await Promise.all([
            fetch(`/api/esports/standings?league=${encodeURIComponent(leagueKey)}`),
            fetch(`/api/esports/schedule?league=${encodeURIComponent(leagueKey)}`),
            fetch(`/api/esports/rosters?league=${encodeURIComponent(leagueKey)}`),
          ]);
          if (sRes.ok) {
            const sJson = await sRes.json();
            const rankings = (sJson?.data?.rankings || []) as {
              name: string;
              slug?: string;
              wins?: number;
              losses?: number;
            }[];
            setStandingsByLeague(prev => ({
              ...prev,
              [leagueKey]: rankings.reduce(
                (acc, t) => {
                  const key = t.slug || slugifyTeam(t.name);
                  acc[key] = { wins: t.wins, losses: t.losses };
                  return acc;
                },
                {} as Record<string, { wins?: number; losses?: number }>,
              ),
            }));
          }
          if (mRes.ok) {
            const mJson = await mRes.json();
            const nextByTeam = (mJson?.data?.nextByTeam || {}) as Record<
              string,
              { opponent: string; startTime: string }
            >;
            const mapped: Record<string, { opponent: string; startTime: string }> = {};
            Object.entries(nextByTeam).forEach(([teamName, info]) => {
              mapped[slugifyTeam(teamName)] = info;
            });
            setNextMatchByLeague(prev => ({ ...prev, [leagueKey]: mapped }));
          }
          if (rRes.ok) {
            const rJson = await rRes.json();
            const rostersByTeam = (rJson?.data?.rostersByTeam || {}) as Record<
              string,
              { role: "上" | "野" | "中" | "下" | "辅"; player: string }[]
            >;
            const subsByTeam = (rJson?.data?.subsByTeam || {}) as Record<string, string[]>;
            if (rostersByTeam && Object.keys(rostersByTeam).length > 0) {
              setRostersByLeague(prev => ({ ...prev, [leagueKey]: rostersByTeam }));
            }
            if (subsByTeam && Object.keys(subsByTeam).length > 0) {
              setRosterSubsByLeague(prev => ({ ...prev, [leagueKey]: subsByTeam }));
            }
          }
        } catch (e) {
          console.warn("额外关注数据加载失败", leagueKey, e);
        }
      }),
    ).catch(() => void 0);
  }, [selectedTab, remoteLeagues, defaultLeagues]);

  const [viewer, setViewer] = useState<WorkItem | null>(null);
  const [closing, setClosing] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const accent = useImagePalette(viewer?.img || "");

  useEffect(() => {
    setClosing(false);
  }, [viewer]);
  useEffect(() => {
    if (viewer) closeBtnRef.current?.focus();
  }, [viewer]);
  useEffect(() => {
    if (!viewer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseViewer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewer]);

  const handleCloseViewer = () => {
    setClosing(true);
    setTimeout(() => setViewer(null), 500);
  };

  const provenance = useMemo(() => {
    if (!viewer) return [] as Array<any>;
    return [
      { at: "2024-03-01 10:24", action: "铸造", by: viewer.author, tx: "0x9e...a7" },
      { at: "2024-03-06 14:02", action: "转移", by: "0xA1b...19", to: "0xF5c...02", tx: "0x71...4b" },
      { at: "2024-04-10 09:10", action: "上架", by: "0xF5c...02", price: "0.28 ETH", tx: "0x88...11" },
      {
        at: "2024-04-12 18:33",
        action: "成交",
        by: "0xF5c...02",
        to: "0x3D4...9c",
        price: "0.28 ETH",
        tx: "0x98...de",
      },
    ];
  }, [viewer]);
  console.log("provenance", provenance);
  const comments = useMemo(() => {
    if (!viewer) return [] as Array<any>;
    return [
      { user: "Alice", when: "2天前", text: "光影很高级，细节处理很到位。", up: 12 },
      { user: "Bob", when: "1天前", text: "主题和构图很耐看，收藏了。", up: 8 },
      { user: "陈一", when: "5小时前", text: "色彩层次很舒服，想看作者更多作品！", up: 5 },
    ];
  }, [viewer]);
  console.log("comments", comments);

  return (
    <section className="w-full bg-base-200">
      <div className="relative w-full mx-auto max-w-none px-2 md:px-4 py-6">
        {/* Hero Section */}
        <div className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden mb-12 group shadow-2xl">
          <Image
            src={linusImages[0]}
            alt="Hero Background"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-base-300/95 via-base-300/70 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-4xl">
            <div className="badge badge-primary mb-4 animate-fade-in-up">New Collection Drop</div>
            <h1 className="text-5xl md:text-7xl font-bold font-space-grotesk mb-6 leading-tight animate-fade-in-up delay-100">
              Discover & Collect <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Digital Masterpieces
              </span>
            </h1>
            <p className="text-lg md:text-xl opacity-80 mb-8 max-w-xl animate-fade-in-up delay-200">
              Experience the next generation of digital ownership. Explore curated collections, support your favorite
              teams, and join the revolution.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
              <Link
                href="/marketplace"
                className="btn btn-primary btn-lg shadow-lg hover:shadow-primary/50 transition-all border-none"
              >
                探索市场
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="/myNFTs"
                className="btn btn-lg bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:border-white/40"
              >
                我的收藏
              </Link>
            </div>
          </div>

          {/* Floating Glass Card */}
          <div className="hidden lg:block absolute right-20 top-1/2 -translate-y-1/2 w-80 h-96 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-4 animate-float">
            <div className="relative w-full h-64 rounded-xl overflow-hidden mb-4">
              <Image src={linusImages[5]} alt="Featured" fill className="object-cover" />
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">空灵守护者#88</h3>
                <p className="text-sm text-white/60">收藏:天人工作室</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border-2 border-white/10"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-500 border-2 border-white/10"></div>
                  </div>
                  <span className="text-xs text-white/50">12+ 出价</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/50">当前出价</div>
                  <div className="text-lg font-bold text-primary">2.5 ETH</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <section className="mt-8">
          <div className="sticky top-0 z-10 bg-base-200/80 backdrop-blur">
            <div className="flex items-center">
              <button className="btn btn-ghost" onClick={() => scrollCategories("prev")} aria-label="分类左滚">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div
                ref={catScrollRef}
                className="flex gap-2 overflow-x-auto no-scrollbar px-2 snap-x snap-mandatory"
                style={{ scrollBehavior: "smooth" }}
              >
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    aria-current={selectedCategory === cat ? "true" : undefined}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-full border snap-start ${selectedCategory === cat
                        ? "bg-primary text-primary-content border-primary after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-primary"
                        : "bg-base-100 border-base-300"
                      }`}
                  >
                    <span className="text-sm">{cat}</span>
                  </button>
                ))}
              </div>
              <button className="btn btn-ghost" onClick={() => scrollCategories("next")} aria-label="分类右滚">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* NFT Shortcuts */}
        <section className="mt-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-semibold">NFT 快捷入口</h2>
            <div className="flex gap-2">
              <Link href="/marketplace" className="btn btn-sm">
                前往市场
              </Link>
              <Link href="/myNFTs" className="btn btn-sm btn-secondary">
                我的NFT
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <Link
              href="/marketplace"
              className="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow hover:shadow-xl transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3 7h18M5 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9 11h6v6H9z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Marketplace</div>
                  <div className="text-xs opacity-70">浏览、购买与管理挂单</div>
                </div>
              </div>
            </Link>

            <Link
              href="/myNFTs"
              className="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow hover:shadow-xl transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">我的NFT</div>
                  <div className="text-xs opacity-70">查看与管理持有的 NFT</div>
                </div>
              </div>
            </Link>

            <Link
              href="/transfers"
              className="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow hover:shadow-xl transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M17 14l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 4H7v16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">转移事件</div>
                  <div className="text-xs opacity-70">实时查看 Transfer 事件</div>
                </div>
              </div>
            </Link>

            <Link
              href="/blockexplorer"
              className="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow hover:shadow-xl transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black/10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">区块浏览器</div>
                  <div className="text-xs opacity-70">本地区块与交易细节</div>
                </div>
              </div>
            </Link>

            <Link
              href="/ipfsUpload"
              className="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow hover:shadow-xl transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 9l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">上传到 IPFS</div>
                  <div className="text-xs opacity-70">元数据与图片上传</div>
                </div>
              </div>
            </Link>

            <Link
              href="/ipfsDownload"
              className="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow hover:shadow-xl transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 19V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 15l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M4 5h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">从 IPFS 下载</div>
                  <div className="text-xs opacity-70">查看与验证元数据</div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Works List */}
        <section className="mt-6">
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`px-4 py-2 rounded-full ${selectedTab === tab.key ? "bg-primary text-primary-content" : "bg-base-100"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Recommend Tab */}
          {selectedTab === "recommend" && (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {workTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedWorkTag(tag)}
                      className={`px-3 py-1 rounded-full border text-sm ${selectedWorkTag === tag
                          ? "bg-secondary text-secondary-content border-secondary"
                          : "bg-base-100 border-base-300"
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <button className="btn btn-sm" onClick={refreshRecommendWorks} aria-label="换一批">
                  换一批
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
                {filteredRecommendWorks.map(work => (
                  <div
                    key={work.id}
                    className="group relative bg-base-100 rounded-2xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-primary/50"
                    onClick={() => setViewer(work)}
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden">
                      <Image
                        src={work.img}
                        alt={work.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <div className="font-bold text-sm truncate">{work.title}</div>
                        <div className="flex justify-between items-center mt-1 text-xs opacity-80">
                          <span>{work.author}</span>
                          <span className="flex items-center gap-1">{work.view}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow Tab */}
          {selectedTab === "follow" && (
            <div className="mt-6">
              {(remoteLeagues ?? defaultLeagues).map(league => (
                <div key={league.key} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-base font-semibold">{league.label} 战队</div>
                    <div className="text-xs opacity-60">共 {league.teams.length} 支</div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {league.teams.map(team => {
                      const slug = team.logoSlug || slugifyTeam(team.name);
                      const logoSrc = `/teams/${slug}.svg`;
                      const rec = standingsByLeague[league.key]?.[slug];
                      const nm = nextMatchByLeague[league.key]?.[slug];
                      const rosterList =
                        team.roster && team.roster.length > 0 ? team.roster : rostersByLeague[league.key]?.[slug];
                      console.log("rosterList", rosterList);
                      const wins = rec?.wins ?? undefined;
                      const losses = rec?.losses ?? undefined;
                      const total = (wins ?? 0) + (losses ?? 0);
                      const winrate = total > 0 ? Math.round(((wins ?? 0) / total) * 100) : undefined;
                      return (
                        <div
                          key={`${league.key}-${team.name}`}
                          className="rounded-xl border border-base-300 bg-base-100 p-3 shadow hover:shadow-md transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={logoSrc}
                                alt={`${team.name} logo`}
                                className="w-9 h-9 rounded-full object-contain bg-base-200"
                                onError={e => {
                                  (e.currentTarget as HTMLImageElement).style.display = "none";
                                }}
                              />
                              <div className="font-medium text-sm">{team.name}</div>
                            </div>
                          </div>
                          <div className="mt-1 text-xs opacity-80">
                            {wins !== undefined && losses !== undefined ? (
                              <span>
                                战绩：{wins}-{losses}（{winrate}%）
                              </span>
                            ) : (
                              <span>战绩：待同步</span>
                            )}
                          </div>
                          <div className="mt-2 text-xs opacity-70">
                            下一场：
                            {nm ? (
                              <span className="ml-1">VS {nm.opponent}</span>
                            ) : (
                              <span className="ml-1 opacity-60">待公布</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Standings Tab */}
          {selectedTab === "standings" && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-base font-semibold">赛区积分</div>
                <select
                  className="select select-sm select-bordered"
                  value={standingsLeague}
                  onChange={e => setStandingsLeague(e.target.value)}
                >
                  {["LCK", "LPL", "LEC", "LCS", "PCS", "VCS", "LJL", "CBLOL", "LLA"].map(l => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              {!standings ? (
                <div className="flex justify-center items-center mt-10">
                  <span className="loading loading-spinner loading-lg" />
                </div>
              ) : standings.rankings.length === 0 ? (
                <div className="text-sm opacity-70">暂无积分数据，稍后再试～</div>
              ) : (
                <div className="overflow-x-auto shadow max-h-[60vh]">
                  <table className="table table-zebra w-full">
                    <thead className="sticky top-0 bg-base-100 z-10">
                      <tr>
                        <th>#</th>
                        <th>战队</th>
                        <th>胜</th>
                        <th>负</th>
                        <th>胜率</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.rankings.map((t, idx) => {
                        const wins = t.wins ?? 0;
                        const losses = t.losses ?? 0;
                        const total = wins + losses;
                        const winrate = total > 0 ? Math.round((wins / total) * 100) : 0;
                        return (
                          <tr key={`${t.slug}-${idx}`}>
                            <td>{idx + 1}</td>
                            <td>{t.name}</td>
                            <td>{wins}</td>
                            <td>{losses}</td>
                            <td>{winrate}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Viewer Modal */}
      {viewer && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={handleCloseViewer}
        >
          <div className="flip-modal relative w-[92vw] md:w-[70vw]" onClick={e => e.stopPropagation()}>
            <div
              className={`flip-modal-inner ${closing ? "animate-explode-out" : "animate-explode-in"} rounded-2xl overflow-hidden bg-neutral-900 shadow-2xl`}
              style={{ boxShadow: accent ? `0 0 0 1px ${accent}33, 0 12px 40px -8px #000` : undefined }}
            >
              <Image
                src={viewer.img}
                alt=""
                fill
                sizes="(max-width:768px) 92vw, 70vw"
                className="object-cover blur-lg opacity-40 scale-110"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent"></div>

              <button
                className="btn btn-ghost btn-md absolute top-3 right-3 z-30 text-lg leading-none hover:opacity-90"
                style={{ color: accent ?? undefined }}
                onClick={handleCloseViewer}
                ref={closeBtnRef}
              >
                x
              </button>

              <AdaptiveImage
                src={viewer.img}
                alt={viewer.title}
                sizes="(max-width:768px) 92vw, 70vw"
                fit="contain"
                quality={95}
                priority
                maxHeight="80vh"
              />
            </div>
            <div
              className="mt-3 rounded-xl p-3 bg-black/40 backdrop-blur-sm text-base-100"
              style={{ border: `1px solid ${accent ?? "rgba(255,255,255,0.1)"}` }}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold" style={{ color: accent ?? undefined }}>
                  {viewer.title}
                </div>
                <div className="text-sm opacity-80">{viewer.view} 次浏览</div>
              </div>
              <div className="mt-1 text-sm opacity-85">
                作者：{viewer.author} · 标签：{viewer.tag}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .flip-modal {
          perspective: 1600px;
        }
        .flip-modal-inner {
          transform-style: preserve-3d;
          backface-visibility: hidden;
          will-change: transform, filter, opacity;
        }
        .animate-explode-in {
          animation: explodeIn 1400ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .animate-explode-out {
          animation: explodeOut 800ms cubic-bezier(0.22, 0.7, 0.2, 0.96);
        }
        @keyframes explodeIn {
          0% {
            transform: translateY(34px) rotateY(38deg) scale(0.84);
            filter: blur(1.8px) saturate(1.08) contrast(1.02);
            opacity: 0;
          }
          30% {
            transform: translateY(-8px) rotateY(-12deg) scale(1.12);
            filter: blur(0.5px) saturate(1.14) contrast(1.05);
            opacity: 1;
          }
          60% {
            transform: translateY(0) rotateY(3deg) scale(1);
            filter: blur(0.2px) saturate(1.06) contrast(1.03);
          }
          100% {
            transform: translateY(0) rotateY(0deg) scale(1);
            filter: none;
          }
        }
        @keyframes explodeOut {
          0% {
            transform: rotateY(0deg) scale(1);
            opacity: 1;
          }
          40% {
            transform: rotateY(-10deg) scale(0.9) translateY(10px);
            filter: blur(0.8px);
            opacity: 0.6;
          }
          100% {
            transform: rotateY(-60deg) scale(0.72) translateY(24px);
            filter: blur(1.8px);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default Home;
