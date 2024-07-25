import { serveDir } from "https://deno.land/std@0.223.0/http/file_server.ts";

let previousWord = "";
const usedWords = new Set();

function getRandomWord() {
    const words = ["りんご", "ごま", "まぐろ", "ろうそく", "くつした"]; // 適当な単語リスト
    return words[Math.floor(Math.random() * words.length)];
}

previousWord = getRandomWord();

Deno.serve(async (request) => {
    const pathname = new URL(request.url).pathname;

    if (request.method === "GET" && pathname === "/shiritori") {
        return new Response(previousWord);
    }

    if (request.method === "POST" && pathname === "/shiritori") {
        const requestJson = await request.json();
        const nextWord = requestJson["nextWord"];

        if (nextWord.slice(-1) === "ん") {
            return new Response(
                JSON.stringify({
                    "errorMessage": "「ん」で終わる単語が入力されたため、ゲームを終了します",
                    "errorCode": "10002"
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json; charset=utf-8" },
                }
            );
        }

        if (usedWords.has(nextWord)) {
            return new Response(
                JSON.stringify({
                    "errorMessage": "過去に使用した単語です。別の単語を入力してください。",
                    "errorCode": "10003"
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json; charset=utf-8" },
                }
            );
        }

        if (previousWord.slice(-1) === nextWord.slice(0, 1)) {
            previousWord = nextWord;
            usedWords.add(nextWord);
        } else {
            return new Response(
                JSON.stringify({
                    "errorMessage": "前の単語に続いていません",
                    "errorCode": "10001"
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json; charset=utf-8" },
                }
            );
        }

        return new Response(previousWord);
    }

    if (request.method === "GET" && pathname === "/reset") {
        previousWord = getRandomWord();
        usedWords.clear(); // 使用済みの単語リストをクリアする
        return new Response("ゲームがリセットされました");
    }

    return serveDir(request, {
        fsRoot: "./public/",
        urlRoot: "",
        enableCors: true,
    });
});
