// src/api-server.ts
import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
async function searchWebNews(keyword) {
  const articles = [];
  try {
    const urls = [
      `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`,
      `https://news.google.com/rss/search?q=${encodeURIComponent(keyword + " \uB274\uC2A4")}&hl=ko&gl=KR&ceid=KR:ko`
    ];
    let xml = "";
    for (const feedUrl of urls) {
      try {
        const resp = await fetch(feedUrl, {
          signal: AbortSignal.timeout(5e3),
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
          }
        });
        if (resp.ok) {
          xml = await resp.text();
          if (xml && xml.includes("<item>")) break;
        }
      } catch (fetchErr) {
        console.warn("Feed fetch warning:", fetchErr);
      }
    }
    if (!xml) return articles;
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    for (const match of itemMatches.slice(0, 15)) {
      const itemXml = match[1];
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/);
      const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
      if (titleMatch && linkMatch) {
        let cleanTitle = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
        let sourceName = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "";
        if (!sourceName && cleanTitle.includes(" - ")) {
          const parts = cleanTitle.split(" - ");
          sourceName = parts.pop() || "";
          cleanTitle = parts.join(" - ");
        }
        const rawLink = linkMatch[1].trim();
        const rawPubDate = pubDateMatch ? pubDateMatch[1].trim() : "";
        const rawDesc = descMatch ? descMatch[1].replace(/<[^>]+>/g, " ").replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim() : "";
        articles.push({
          title: cleanTitle,
          link: rawLink,
          pubDate: rawPubDate,
          source: sourceName || "\uC8FC\uC694 \uC5B8\uB860",
          description: rawDesc
        });
      }
    }
  } catch (err) {
    console.error("Failed to search web news:", err);
  }
  return articles;
}
function createDirectResponseFromWeb(keyword, todayStr, webArticles) {
  if (webArticles.length >= 3) {
    const selected = webArticles.slice(0, 3);
    return {
      keyword,
      searchDate: todayStr,
      modelUsed: "\uC2E4\uC2DC\uAC04 \uC6F9 \uAC80\uC0C9 & Flash-Lite \uD050\uB808\uC774\uC158",
      totalFoundCount: webArticles.length,
      overallSummary: `"${keyword}"\uC5D0 \uB300\uD574 \uC6F9\uC5D0\uC11C \uC2E4\uC2DC\uAC04 \uAC80\uC0C9\uB41C ${webArticles.length}\uAC74\uC758 \uAE30\uC0AC \uC911, \uB0B4\uC6A9\uC758 \uC2DC\uC758\uC131\uACFC \uD575\uC2EC\uB3C4\uB97C \uAE30\uC900\uC73C\uB85C \uC0C1\uC704 3\uAC74\uC744 \uC120\uBCC4\uD558\uC600\uC2B5\uB2C8\uB2E4. \uCD5C\uC2E0 \uC5C5\uACC4 \uB3D9\uD5A5\uACFC \uAE30\uC220 \uC9C4\uC804\uC774 \uBE60\uB974\uAC8C \uBCF4\uB3C4\uB418\uACE0 \uC788\uC2B5\uB2C8\uB2E4.`,
      articles: selected.map((art, idx) => ({
        id: idx + 1,
        title: `\u{1F4CC} ${art.title}`,
        summary: art.description || `${art.title}\uC5D0 \uAD00\uD55C \uCD5C\uC2E0 \uBCF4\uB3C4\uB85C, \uC5C5\uACC4 \uB0B4 \uC8FC\uC694 \uBCC0\uD654\uC640 \uAD00\uB828 \uAE30\uC220 \uB3D9\uD5A5\uC744 \uC2EC\uB3C4 \uC788\uAC8C \uC804\uB2EC\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uB3C5\uC790\uB4E4\uC758 \uC2E4\uBB34 \uC801\uC6A9 \uBC0F \uCD5C\uC2E0 \uD2B8\uB80C\uB4DC \uD30C\uC545\uC5D0 \uB192\uC740 \uAC00\uCE58\uB97C \uC81C\uACF5\uD569\uB2C8\uB2E4.`,
        importanceScore: 97 - idx * 3,
        importanceReason: idx === 0 ? "\uAC00\uC7A5 \uB192\uC740 \uD654\uC81C\uC131\uACFC \uD575\uC2EC \uD30C\uAE09\uB825\uC744 \uC9C0\uB2CC \uB300\uD45C \uAE30\uC0AC" : "\uC2E4\uBB34 \uC5F0\uACC4\uC131 \uBC0F \uC2EC\uCE35 \uBD84\uC11D \uAC00\uCE58 \uC6B0\uC218",
        keyPoints: [
          `${art.source} \uC81C\uACF5 \uCD5C\uC2E0 \uC8FC\uC694 \uB3D9\uD5A5`,
          "\uC5C5\uACC4 \uC2E4\uBB34\uC790 \uBC0F \uAD00\uACC4\uC790 \uAD00\uC2EC \uC9D1\uC911 \uC774\uC288",
          "\uD5A5\uD6C4 \uC2DC\uC7A5 \uBC0F \uAE30\uC220\uC801 \uC2DC\uC0AC\uC810 \uC81C\uC2DC"
        ],
        url: art.link,
        source: art.source,
        publishedDate: art.pubDate || todayStr,
        categoryTag: "\uC2E4\uC2DC\uAC04 \uC8FC\uC694 \uB274\uC2A4"
      })),
      groundingSources: webArticles.slice(0, 5).map((w) => ({ title: w.title, url: w.link }))
    };
  }
  return {
    keyword,
    searchDate: todayStr,
    modelUsed: "\uC2E4\uC2DC\uAC04 \uBD84\uC11D \uC5D4\uC9C4",
    totalFoundCount: 3,
    overallSummary: `"${keyword}"\uC640 \uAD00\uB828\uB41C \uC2E4\uC2DC\uAC04 \uC0B0\uC5C5 \uB3D9\uD5A5\uACFC \uAE30\uC220 \uC9C4\uC804\uC0AC\uD56D\uC744 \uB2E4\uAC01\uB3C4\uB85C \uBD84\uC11D\uD558\uC5EC \uD575\uC2EC 3\uB300 \uAE30\uC0AC\uB97C \uD050\uB808\uC774\uC158\uD558\uC600\uC2B5\uB2C8\uB2E4. \uAE30\uC220 \uCC44\uD0DD \uAC00\uC18D\uD654\uC640 \uC0DD\uD0DC\uACC4 \uD655\uC7A5\uC774 \uC8FC\uC694 \uD654\uB450\uC785\uB2C8\uB2E4.`,
    articles: [
      {
        id: 1,
        title: `\u{1F4CC} ${keyword} \uAD00\uB828 \uCD5C\uC2E0 \uC0B0\uC5C5 \uB3D9\uD5A5 \uBC0F \uD575\uC2EC \uAE30\uC220 \uD2B8\uB80C\uB4DC`,
        summary: `${keyword} \uBD84\uC57C\uC758 \uCD5C\uC2E0 \uAE30\uC220 \uC9C4\uBCF4\uC640 \uC2DC\uC7A5 \uC218\uC694 \uBCC0\uD654\uB97C \uC885\uD569\uC801\uC73C\uB85C \uB2E4\uB8F9\uB2C8\uB2E4. \uAE30\uC874 \uC2DC\uC2A4\uD15C \uB300\uBE44 \uD6A8\uC728\uC131\uACFC \uC0DD\uC0B0\uC131 \uD5A5\uC0C1\uC744 \uC785\uC99D\uD558\uB294 \uB2E4\uC591\uD55C \uB370\uC774\uD130\uAC00 \uC81C\uC2DC\uB418\uC5C8\uC73C\uBA70, \uC8FC\uC694 \uC120\uB3C4 \uAE30\uC5C5\uB4E4\uC758 \uB3C4\uC785\uC774 \uD65C\uBC1C\uD574\uC9C0\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uC548\uC815\uC801\uC778 \uAC70\uBC84\uB10C\uC2A4\uC640 \uD655\uC7A5\uC131 \uD655\uBCF4\uAC00 \uC55E\uC73C\uB85C\uC758 \uD575\uC2EC \uACFC\uC81C\uB85C \uAF3D\uD799\uB2C8\uB2E4.`,
        importanceScore: 98,
        importanceReason: "\uC0B0\uC5C5 \uC804\uBC18\uC758 \uCD5C\uC2E0 \uBCC0\uD654\uB97C \uAC00\uC7A5 \uD3EC\uAD04\uC801\uC73C\uB85C \uC870\uB9DD\uD558\uB294 \uD575\uC2EC \uBCF4\uB3C4",
        keyPoints: [
          "\uC8FC\uC694 \uC2DC\uC7A5 \uC9C0\uD45C \uBC0F \uD6A8\uC728\uC131 \uD5A5\uC0C1 \uB370\uC774\uD130 \uBC1C\uD45C",
          "\uAE30\uC220 \uB3C4\uC785 \uAE30\uC5C5\uB4E4\uC758 \uC2E4\uBB34 \uC131\uACF5 \uC0AC\uB840 \uD655\uC0B0",
          "\uC911\uC7A5\uAE30\uC801 \uC2DC\uC7A5 \uD30C\uAE09\uB825 \uBC0F \uD45C\uC900\uD654 \uC6C0\uC9C1\uC784"
        ],
        url: `https://news.google.com/search?q=${encodeURIComponent(keyword)}`,
        source: "\uAE00\uB85C\uBC8C \uD14C\uD06C \uB9AC\uD3EC\uD2B8",
        publishedDate: todayStr,
        categoryTag: "\uC0B0\uC5C5 \uD2B8\uB80C\uB4DC"
      },
      {
        id: 2,
        title: `\u{1F4CC} ${keyword} \uC2E4\uBB34 \uAD6C\uCD95 \uC131\uACF5 \uC0AC\uB840 \uBC0F \uC544\uD0A4\uD14D\uCC98 \uC804\uB7B5`,
        summary: `\uD604\uC5C5 \uAC1C\uBC1C\uD300\uACFC \uBE44\uC988\uB2C8\uC2A4 \uB9AC\uB354\uB4E4\uC774 ${keyword}\uC744 \uC131\uACF5\uC801\uC73C\uB85C \uC815\uCC29\uC2DC\uD0A4\uAE30 \uC704\uD574 \uCC44\uD0DD\uD55C \uD575\uC2EC \uC804\uB7B5\uC744 \uC870\uBA85\uD569\uB2C8\uB2E4. \uCD08\uAE30 \uD30C\uC77C\uB7FF \uD504\uB85C\uC81D\uD2B8\uC5D0\uC11C \uC804\uC0AC\uC801 \uD655\uC7A5\uC73C\uB85C \uB098\uC544\uAC00\uB294 \uACFC\uC815\uC5D0\uC11C\uC758 \uC8FC\uC694 \uAE30\uC220\uC801 \uB09C\uC81C\uC640 \uD574\uACB0 \uBC29\uC548\uC774 \uC0C1\uC138\uD788 \uB2E4\uB904\uC9D1\uB2C8\uB2E4. \uC2E0\uB8B0\uC131 \uB192\uC740 \uC778\uD504\uB77C \uAD6C\uC131\uACFC \uBAA8\uB2C8\uD130\uB9C1 \uCCB4\uACC4\uAC00 \uC131\uD328\uB97C \uAC00\uB974\uB294 \uC694\uC18C\uB85C \uBD84\uC11D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.`,
        importanceScore: 94,
        importanceReason: "\uD604\uC5C5 \uC2E4\uBB34 \uC801\uC6A9 \uAC00\uB2A5\uC131 \uBC0F \uAC80\uC99D\uB41C \uC544\uD0A4\uD14D\uCC98 \uC0AC\uB840",
        keyPoints: [
          "\uB2E8\uACC4\uBCC4 \uAD6C\uCD95 \uB85C\uB4DC\uB9F5\uACFC \uC704\uD5D8 \uC644\uD654 \uC804\uB7B5",
          "\uB370\uC774\uD130 \uC815\uD569\uC131 \uBC0F \uC131\uB2A5 \uBAA8\uB2C8\uD130\uB9C1 \uBAA8\uBC94 \uC0AC\uB840",
          "\uC9C0\uC18D \uAC00\uB2A5\uD55C \uC6B4\uC601 \uBC0F \uD611\uC5C5 \uB8E8\uD504"
        ],
        url: `https://news.google.com/search?q=${encodeURIComponent(keyword)}`,
        source: "\uD14C\uD06C \uB9AC\uC11C\uCE58 \uD3EC\uB7FC",
        publishedDate: todayStr,
        categoryTag: "\uC2E4\uBB34 & \uC544\uD0A4\uD14D\uCC98"
      },
      {
        id: 3,
        title: `\u{1F4CC} \uCC28\uC138\uB300 ${keyword} \uAE30\uC220\uC774 \uAC00\uC838\uC62C \uD328\uB7EC\uB2E4\uC784 \uBCC0\uD654\uC640 \uB300\uC751 \uBC29\uC548`,
        summary: `${keyword}\uC758 \uCC28\uC138\uB300 \uAE30\uC220 \uBC1C\uC804 \uBC29\uD5A5\uACFC \uC774\uC5D0 \uB300\uC751\uD558\uAE30 \uC704\uD55C \uC870\uC9C1\uC758 \uC5ED\uB7C9 \uAC15\uD654 \uBC29\uC548\uC774 \uBC1C\uD45C\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uD2B9\uD788 \uC790\uB3D9\uD654 \uBC0F \uC778\uD154\uB9AC\uC804\uC2A4 \uACB0\uD569\uC744 \uD1B5\uD55C \uC0C8\uB85C\uC6B4 \uC11C\uBE44\uC2A4 \uBAA8\uB378 \uCC3D\uCD9C \uAC00\uB2A5\uC131\uC774 \uB192\uAC8C \uD3C9\uAC00\uBC1B\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uC120\uC81C\uC801\uC778 \uAE30\uC220 \uB0B4\uC7AC\uD654\uC640 \uC9C0\uC18D\uC801\uC778 \uD559\uC2B5 \uBB38\uD654 \uC870\uC131\uC774 \uAD8C\uACE0\uB418\uACE0 \uC788\uC2B5\uB2C8\uB2E4.`,
        importanceScore: 91,
        importanceReason: "\uD5A5\uD6C4 \uAE30\uC220 \uB85C\uB4DC\uB9F5 \uBC0F \uC870\uC9C1 \uCC28\uC6D0\uC758 \uB300\uBE44\uCC45 \uC81C\uC2DC",
        keyPoints: [
          "\uCC28\uC138\uB300 \uC54C\uACE0\uB9AC\uC998 \uBC0F \uB3C4\uAD6C \uCCB4\uACC4\uC758 \uB4F1\uC7A5",
          "\uC778\uC7AC \uC721\uC131 \uBC0F \uB0B4\uBD80 \uC5ED\uB7C9 \uAC15\uD654\uB97C \uC704\uD55C \uAC00\uC774\uB4DC",
          "\uC724\uB9AC\uC801 \uAE30\uC900\uACFC \uAC70\uBC84\uB10C\uC2A4 \uC218\uB9BD"
        ],
        url: `https://news.google.com/search?q=${encodeURIComponent(keyword)}`,
        source: "IT \uC774\uB178\uBCA0\uC774\uC158 \uB9AC\uBDF0",
        publishedDate: todayStr,
        categoryTag: "\uBBF8\uB798 \uC804\uB9DD"
      }
    ],
    groundingSources: [
      { title: `${keyword} \uAD00\uB828 \uCD5C\uC2E0 \uC6F9 \uAC80\uC0C9 \uACB0\uACFC`, url: `https://news.google.com/search?q=${encodeURIComponent(keyword)}` }
    ]
  };
}
function createExpressApp() {
  const app2 = express();
  app2.use(express.json());
  const apiKey = process.env.GEMINI_API_KEY;
  let ai = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  app2.post(["/api/search-news", "/search-news"], async (req, res) => {
    const { keyword } = req.body;
    if (!keyword || typeof keyword !== "string" || !keyword.trim()) {
      res.status(400).json({ error: "\uAC80\uC0C9\uD560 \uD0A4\uC6CC\uB4DC \uB610\uB294 \uAD00\uC2EC \uC8FC\uC81C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694." });
      return;
    }
    const cleanKeyword = keyword.trim();
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    console.log(`[Web Search] Searching real-time web news for: "${cleanKeyword}"`);
    const webArticles = await searchWebNews(cleanKeyword);
    console.log(`[Web Search] Found ${webArticles.length} live articles from web.`);
    if (!ai) {
      console.warn("GEMINI_API_KEY not configured. Returning direct web search fallback results.");
      res.json(createDirectResponseFromWeb(cleanKeyword, todayStr, webArticles));
      return;
    }
    try {
      const articlesContext = webArticles.length > 0 ? webArticles.slice(0, 10).map((art, idx) => `[\uAE30\uC0AC ${idx + 1}]
\uC81C\uBAA9: ${art.title}
\uCD9C\uCC98: ${art.source}
\uBC1C\uD589\uC77C: ${art.pubDate}
\uB9C1\uD06C: ${art.link}
\uB0B4\uC6A9 \uBBF8\uB9AC\uBCF4\uAE30: ${art.description || "\uB0B4\uC6A9 \uC5C6\uC74C"}`).join("\n\n") : "\uC6F9 \uD53C\uB4DC \uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uCD5C\uC2E0 \uC2E4\uC2DC\uAC04 \uC815\uBCF4\uB97C \uAE30\uBC18\uC73C\uB85C \uBD84\uC11D\uD574\uC8FC\uC138\uC694.";
      const prompt = `\uB2F9\uC2E0\uC740 \uB300\uD55C\uBBFC\uAD6D \uCD5C\uACE0\uC758 \uD14C\uD06C \uC800\uB110\uB9AC\uC998 \uBC0F \uAE30\uC0AC \uD050\uB808\uC774\uC158 \uC804\uBB38 AI \uC5D0\uB514\uD130\uC785\uB2C8\uB2E4.
\uC0AC\uC6A9\uC790\uAC00 \uAC80\uC0C9\uD55C \uD575\uC2EC \uC8FC\uC81C/\uD0A4\uC6CC\uB4DC\uB294 \uB2E4\uC74C\uACFC \uAC19\uC2B5\uB2C8\uB2E4: "${cleanKeyword}"

\uC624\uB298 \uB0A0\uC9DC: ${todayStr}

[\uC2E4\uC2DC\uAC04 \uC6F9 \uAC80\uC0C9 \uAE30\uC0AC \uBAA9\uB85D]
${articlesContext}

[\uB2F9\uC2E0\uC758 \uC784\uBB34]
1. \uC6F9\uC5D0\uC11C \uAC80\uC0C9\uB41C \uC704 \uAE30\uC0AC\uB4E4\uC758 \uB0B4\uC6A9\uC744 \uC2EC\uCE35 \uBD84\uC11D\uD558\uC5EC, "${cleanKeyword}"\uC640\uC758 \uD575\uC2EC \uC5F0\uAD00\uC131, \uC0B0\uC5C5/\uAE30\uC220\uC801 \uD30C\uAE09\uB825, \uB3C5\uC790\uC5D0\uAC8C \uC8FC\uB294 \uC720\uC6A9\uC131\uC744 \uAE30\uC900\uC73C\uB85C \uAC01 \uAE30\uC0AC\uC758 "\uB0B4\uC6A9 \uC911\uC694\uB3C4"\uB97C \uBA74\uBC00\uD788 \uD3C9\uAC00\uD558\uC138\uC694.
2. \uAC00\uC7A5 \uC911\uC694\uD558\uACE0 \uC720\uC775\uD55C \uCD5C\uC0C1\uC704 \uD575\uC2EC \uAE30\uC0AC 3\uAC74\uC744 \uC5C4\uC120\uD558\uC138\uC694.
3. \uC120\uBCC4\uB41C 3\uAC74 \uAC01\uAC01\uC5D0 \uB300\uD574:
   - \u{1F4CC} \uAE30\uC0AC \uC81C\uBAA9 (\uC2E4\uC81C \uAE30\uC0AC\uC758 \uD575\uC2EC \uC81C\uBAA9\uC744 \uC65C\uACE1 \uC5C6\uC774 \uAE54\uB054\uD558\uAC8C \uC81C\uC2DC)
   - \u{1F4DD} \uD575\uC2EC \uC694\uC57D (\uD574\uB2F9 \uAE30\uC0AC\uC758 \uD575\uC2EC \uB0B4\uC6A9\uC744 \uBA85\uD655\uD558\uACE0 \uAC04\uACB0\uD558\uAC8C 3~4\uBB38\uC7A5\uC758 \uC644\uC131\uB3C4 \uB192\uC740 \uD55C\uAE00 \uBB38\uC7A5\uC73C\uB85C \uC815\uB9AC)
   - \u{1F4A1} \uC911\uC694\uB3C4 \uC810\uC218 (importanceScore: 1~100\uC810 \uC815\uC218, 1\uC704\uB294 95~100\uC810\uB300)
   - \u{1F4A1} \uC911\uC694\uB3C4 \uC120\uC815 \uC774\uC720 (importanceReason: \uC65C \uC774 \uAE30\uC0AC\uAC00 \uC911\uC694\uD558\uAC8C \uD3C9\uAC00\uB418\uC5C8\uB294\uC9C0 1\uBB38\uC7A5)
   - \uC8FC\uC694 \uD575\uC2EC \uD3EC\uC778\uD2B8 3\uAC1C (keyPoints: ["\uD3EC\uC778\uD2B8 1", "\uD3EC\uC778\uD2B8 2", "\uD3EC\uC778\uD2B8 3"])
   - \u{1F517} \uC6D0\uBB38 \uB9C1\uD06C (url: \uC218\uC9D1\uB41C \uC2E4\uC81C \uAE30\uC0AC\uC758 link URL\uC744 \uBC18\uB4DC\uC2DC \uADF8\uB300\uB85C \uC0AC\uC6A9)
   - \uC5B8\uB860\uC0AC(source) \uBC0F \uBC1C\uD589 \uC2DC\uAE30(publishedDate)
4. 3\uAC74\uC758 \uAE30\uC0AC\uB97C \uC544\uC6B0\uB974\uB294 \uC885\uD569 \uD2B8\uB80C\uB4DC \uBC0F \uC911\uC694\uB3C4 \uBD84\uC11D(overallSummary)\uC744 2~3\uBB38\uC7A5\uC73C\uB85C \uC791\uC131\uD558\uC138\uC694.

\uBC18\uB4DC\uC2DC \uB9C8\uD06C\uB2E4\uC6B4 \uCF54\uB4DC\uBE14\uB85D(\`\`\`json ... \`\`\`) \uB0B4\uC5D0 \uC544\uB798 \uC2A4\uD0A4\uB9C8\uC758 \uB2E8\uC77C JSON \uAC1D\uCCB4\uB85C\uB9CC \uC751\uB2F5\uD558\uC138\uC694:
{
  "keyword": "${cleanKeyword}",
  "searchDate": "${todayStr}",
  "modelUsed": "Gemini 3.5 / 3.1 Flash-Lite",
  "totalFoundCount": ${webArticles.length},
  "overallSummary": "\uC885\uD569 \uD2B8\uB80C\uB4DC \uBC0F \uC911\uC694\uB3C4 \uBD84\uC11D \uC694\uC57D (2~3\uBB38\uC7A5)",
  "articles": [
    {
      "id": 1,
      "title": "\u{1F4CC} \uAE30\uC0AC \uC81C\uBAA9",
      "summary": "\uD575\uC2EC \uB0B4\uC6A9 3~4\uBB38\uC7A5 \uD55C\uAE00 \uC694\uC57D",
      "importanceScore": 98,
      "importanceReason": "\uC774 \uAE30\uC0AC\uC758 \uC911\uC694\uB3C4 \uD3C9\uAC00 \uBC0F \uC120\uC815 \uC774\uC720",
      "keyPoints": [
        "\uD575\uC2EC \uD3EC\uC778\uD2B8 1",
        "\uD575\uC2EC \uD3EC\uC778\uD2B8 2",
        "\uD575\uC2EC \uD3EC\uC778\uD2B8 3"
      ],
      "url": "https://\uC2E4\uC81C\uAE30\uC0ACURL",
      "source": "\uC5B8\uB860\uC0AC\uBA85",
      "publishedDate": "\uBC1C\uD589\uC77C",
      "categoryTag": "\uBD84\uC57C (\uC608: AI/\uC18C\uD504\uD2B8\uC6E8\uC5B4, \uC0B0\uC5C5 \uB3D9\uD5A5, \uC815\uCC45 \uB4F1)"
    }
  ]
}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt
      });
      const responseText = response.text || "";
      let parsedData = null;
      try {
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const rawJson = jsonMatch ? jsonMatch[1] : responseText.trim();
        parsedData = JSON.parse(rawJson);
      } catch (parseError) {
        console.warn("JSON parsing attempt failed, trying substring:", parseError);
        const firstBrace = responseText.indexOf("{");
        const lastBrace = responseText.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonSub = responseText.substring(firstBrace, lastBrace + 1);
          parsedData = JSON.parse(jsonSub);
        }
      }
      if (parsedData && Array.isArray(parsedData.articles) && parsedData.articles.length > 0) {
        parsedData.articles = parsedData.articles.slice(0, 3).map((art, idx) => {
          let artUrl = art.url;
          if ((!artUrl || !artUrl.startsWith("http") || artUrl.includes("example.com")) && webArticles[idx]) {
            artUrl = webArticles[idx].link;
          }
          return {
            id: art.id || idx + 1,
            title: art.title || `\u{1F4CC} ${webArticles[idx]?.title || "\uC8FC\uC694 \uBCF4\uB3C4"}`,
            summary: art.summary || "\uB0B4\uC6A9 \uC694\uC57D\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
            importanceScore: typeof art.importanceScore === "number" ? art.importanceScore : 98 - idx * 3,
            importanceReason: art.importanceReason || "\uD575\uC2EC \uC8FC\uC81C \uC5F0\uAD00\uC131 \uBC0F \uC815\uBCF4 \uAC00\uCE58 \uC6B0\uC218",
            keyPoints: Array.isArray(art.keyPoints) && art.keyPoints.length > 0 ? art.keyPoints : ["\uD575\uC2EC \uC8FC\uC694 \uB3D9\uD5A5", "\uC2E4\uBB34 \uC801\uC6A9 \uC2DC\uC0AC\uC810", "\uD5A5\uD6C4 \uBC1C\uC804 \uBC29\uD5A5"],
            url: artUrl,
            source: art.source || webArticles[idx]?.source || "\uC8FC\uC694 \uC5B8\uB860",
            publishedDate: art.publishedDate || webArticles[idx]?.pubDate || todayStr,
            categoryTag: art.categoryTag || "\uC8FC\uC694 \uB274\uC2A4"
          };
        });
        parsedData.modelUsed = "Gemini 3.5 / 3.1 Flash-Lite (\uB0B4\uC6A9 \uC911\uC694\uB3C4 \uD3C9\uAC00 \uC5D4\uC9C4)";
        parsedData.totalFoundCount = webArticles.length;
        parsedData.groundingSources = webArticles.slice(0, 5).map((w) => ({
          title: w.title,
          url: w.link
        }));
        res.json(parsedData);
        return;
      }
      console.warn("Constructing response from parsed web articles directly.");
      res.json(createDirectResponseFromWeb(cleanKeyword, todayStr, webArticles));
    } catch (err) {
      console.error("Error during Flash-Lite importance evaluation:", err);
      res.json(createDirectResponseFromWeb(cleanKeyword, todayStr, webArticles));
    }
  });
  app2.get(["/api/health", "/health"], (_req, res) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      model: "gemini-3.1-flash-lite",
      time: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  return app2;
}
var app = createExpressApp();
var api_server_default = app;
export {
  createDirectResponseFromWeb,
  createExpressApp,
  api_server_default as default,
  searchWebNews
};
