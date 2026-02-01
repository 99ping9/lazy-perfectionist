// src/utils/gemini.ts
// SNS 공개용 범용 Nano Tasks 생성기
// ✅ 어떤 목표(운동/청소/공부/업무/취미/정리/연락 등)든 "구체 행동"으로 쪼개기
// ✅ 금지: 휴식/쉬기/호흡/명상/눈감기/스트레칭/타이머/재설정/알람/시간설정
// ✅ 1인(브라우저) 하루 5회만 Gemini 호출, 이후는 로컬 fallback 플랜
// ✅ 캐시(같은 goal+duration이면 재호출 방지)
// ✅ 결과 후처리(금지어 제거/중복 제거/너무 추상 제거)

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

if (!API_KEY) {
    throw new Error("❌ VITE_GEMINI_API_KEY가 없습니다. .env 파일을 확인하세요.");
}

console.log("✅ LOADED: src/utils/gemini.ts");

// SNS 공개면 효율 좋은 lite 추천
const MODEL = "gemini-2.5-flash-lite";

type NanoTask = {
    id: string;
    text: string;
    isFirstStep?: boolean;
};

/* ---------------------------
   1) 하루 호출 제한 (클라 기준)
---------------------------- */

const DAILY_LIMIT = 5; // ✅ 1인(브라우저) 하루 5회 Gemini 호출

function todayKey(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function callsKey(): string {
    return `geminiCalls:${todayKey()}`;
}

function getTodayCalls(): number {
    try {
        return Number(localStorage.getItem(callsKey()) ?? "0");
    } catch {
        return 0;
    }
}

function canCallGeminiToday(limitPerDay = DAILY_LIMIT): boolean {
    return getTodayCalls() < limitPerDay;
}

function markGeminiCall(): void {
    try {
        const used = getTodayCalls();
        localStorage.setItem(callsKey(), String(used + 1));
    } catch {
        // ignore
    }
}

/* ---------------------------
   2) 캐시 (같은 입력 재사용)
---------------------------- */

function cacheKey(goal: string, duration: string): string {
    return `nanoTasks:v4:${goal.trim()}::${duration.trim()}`;
}

function getCached(goal: string, duration: string): NanoTask[] | null {
    try {
        const raw = localStorage.getItem(cacheKey(goal, duration));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as NanoTask[]) : null;
    } catch {
        return null;
    }
}

function setCached(goal: string, duration: string, tasks: NanoTask[]): void {
    try {
        localStorage.setItem(cacheKey(goal, duration), JSON.stringify(tasks));
    } catch {
        // ignore
    }
}

/* ---------------------------
   3) 로컬 fallback 플랜 (범용)
   - 휴식/호흡/타이머 없이 "구체 행동"만
---------------------------- */

function parseMinutes(duration: string): number {
    const s = duration.replace(/\s/g, "");
    if (s.includes("시간")) {
        const h = parseInt(s, 10);
        return (Number.isFinite(h) ? h : 1) * 60;
    }
    const m = parseInt(s, 10);
    return Number.isFinite(m) ? m : 30;
}

function fallbackPlan(goal: string, duration: string): NanoTask[] {
    const mins = parseMinutes(duration);

    // 30분: 7개 / 1시간: 9개 / 2시간+: 10개
    const targetCount = mins <= 30 ? 7 : mins <= 60 ? 9 : 10;

    // 범용 템플릿 (goal을 자연스럽게 섞어서 "행동"을 만들기)
    // ※ 여기서는 goal이 어떤 형태든 안전하게 들어가도록 괄호로 감쌈
    const g = goal.trim() || "작업";

    const tasks: string[] = [
        "책상에 앉거나 작업할 위치에 서기",
        `(${g})에 필요한 도구/자료를 눈앞에 꺼내기`,
        `(${g})의 '오늘 끝낼 최소 결과물'을 한 줄로 적기`,
        `(${g})를 시작하기 위한 첫 버튼/첫 행동 1개 실행하기 (예: 앱 열기, 도구 켜기, 물건 집기)`,
        `(${g})를 1단계로 진행하기: 아주 작은 단위 1개 처리하기 (예: 1개 치우기, 1세트 하기, 1문단 쓰기)`,
        `(${g}) 진행 중 막히는 지점 1개를 적고, 해결 행동 1개 실행하기`,
        `(${g})를 2단계로 진행하기: 다음 작은 단위 1개 처리하기`,
        `(${g}) 결과를 눈에 보이게 정리/저장하기 (예: 체크 표시, 파일 저장, 완료 사진)`,
        `다음에 이어할 '첫 행동'을 1줄로 남기기`,
        "사용한 도구를 제자리에 두고 완료 체크하기",
    ];

    return tasks.slice(0, targetCount).map((text, idx) => ({
        id: String(idx + 1),
        text,
        isFirstStep: idx === 0,
    }));
}

/* ---------------------------
   4) Gemini 응답 텍스트 추출
---------------------------- */

function getTextFromGeminiResponse(data: any): string {
    return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ??
        ""
    );
}

/* ---------------------------
   5) 후처리: 금지어 제거 + 중복 제거 + 추상 제거
---------------------------- */

function normalizeText(s: string): string {
    return s
        .replace(/\s+/g, " ")
        .replace(/[.,!?"'`()\[\]{}]/g, "")
        .trim()
        .toLowerCase();
}

function postProcess(tasks: NanoTask[]): NanoTask[] {
    // ❌ 강력 금지: 너가 싫어하는 것들
    const banned =
        /(휴식|쉬기|잠깐|스트레칭|명상|호흡|눈\s*감|심호흡|마음\s*가다듬|릴랙스|타이머|알람|스톱워치|재설정|시간\s*설정|설정하고|워밍업|쿨다운)/i;

    // ❌ 추상적/의미 약한 문장
    const vague =
        /(집중하기|열심히|힘내기|마음먹기|의지를|최선을|동기부여|생각하기만|상상만|마음으로)/i;

    // ✅ 너무 짧거나 비어있는 것 방지
    let filtered = tasks.filter((t) => {
        const txt = String(t.text ?? "").trim();
        if (!txt) return false;
        if (txt.length < 4) return false;
        if (banned.test(txt)) return false;
        if (vague.test(txt)) return false;
        return true;
    });

    // ✅ 중복 제거(동일/유사)
    const seen = new Set<string>();
    filtered = filtered.filter((t) => {
        const k = normalizeText(t.text);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });

    // ✅ 최소 개수 보장: 너무 많이 날아갔으면 원본도 섞어줌
    const base = filtered.length >= 5 ? filtered : tasks;

    // ✅ id 재정렬 + 첫 항목 isFirstStep 강제
    const normalized = base.map((t, i) => ({
        id: String(i + 1),
        text: String(t.text ?? "").trim(),
        isFirstStep: i === 0,
    }));

    return normalized;
}

/* ---------------------------
   6) 메인 함수
---------------------------- */

export async function generateNanoTasksFromGemini(
    goal: string,
    duration: string
): Promise<NanoTask[]> {
    console.log("✅ RUNNING generateNanoTasksFromGemini", {
        goal,
        duration,
        model: MODEL,
        todayCalls: getTodayCalls(),
        dailyLimit: DAILY_LIMIT,
    });

    // (A) 캐시
    const cached = getCached(goal, duration);
    if (cached?.length) return cached;

    // (B) 하루 제한 초과면 fallback
    if (!canCallGeminiToday(DAILY_LIMIT)) {
        const fb = postProcess(fallbackPlan(goal, duration));
        setCached(goal, duration, fb);
        return fb;
    }

    // (C) 범용 프롬프트 (구체 행동 강제 + 금지 항목 완전 차단)
    const prompt = `
너는 사용자의 목표를 "지금 당장 실행 가능한 아주 작은 행동 목록"으로 쪼개는 코치다.

사용자 목표: ${goal}
총 집중 시간: ${duration} (※ 앱 타이머가 이미 이 시간으로 돌아가고 있음)

반드시 지켜야 할 규칙:
1) 오직 '구체적인 행동'만 작성. 눈에 보이는 결과가 남아야 한다.
   - 예시(좋음): "청소기 꺼내서 바닥 1구역(2m x 2m)만 밀기", "메일 1개만 답장 보내기", "스쿼트 8회 1세트 하기"
   - 예시(나쁨): "집중하기", "열심히 하기", "마음 가다듬기"
2) 아래 내용은 절대 포함하지 마(단 1개도 금지):
   - 휴식/쉬기/잠깐/스트레칭/명상/호흡/눈감기/심호흡/마음가짐/릴랙스
   - 타이머/알람/스톱워치/재설정/시간 설정/설정하고
3) 각 task는 5~10분 안에 가능한 양으로 만들고, 가능하면 수치(개수/분량/횟수/범위)를 포함해라.
4) 같은 의미/비슷한 문장 반복 금지.
5) 첫 번째 task는 10초 안에 가능한 행동이며 isFirstStep=true.
   - 예: "신발 신기", "책상에 앉기", "노트북 열기", "청소도구 꺼내기", "운동 매트 펴기"
6) 출력은 오직 JSON 배열만. 설명/마크다운/코드블록 금지.

형식:
[
  {"id":"1","text":"노트북을 열고 작업 파일을 열기","isFirstStep":true},
  {"id":"2","text":"해야 할 일을 1줄로 적고 가장 쉬운 것 1개를 고르기"},
  {"id":"3","text":"가장 쉬운 작업 1개를 5~10분 안에 끝내기"}
]
`.trim();

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    try {
        // ✅ 호출 카운트 증가 (연타/남용 방지)
        markGeminiCall();

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                id: { type: "STRING" },
                                text: { type: "STRING" },
                                isFirstStep: { type: "BOOLEAN" },
                            },
                            required: ["id", "text"],
                        },
                    },
                    maxOutputTokens: 520,
                    temperature: 0.2,
                    thinkingConfig: { includeThoughts: false, thinkingBudget: 0 },
                },
            }),
        });

        if (!res.ok) {
            const errText = await res.text().catch(() => "");
            console.error("❌ Gemini HTTP Error", res.status, errText);

            const fb = postProcess(fallbackPlan(goal, duration));
            setCached(goal, duration, fb);
            return fb;
        }

        const data = await res.json();

        if (data?.error) {
            console.error("❌ Gemini API Error:", data.error);
            const fb = postProcess(fallbackPlan(goal, duration));
            setCached(goal, duration, fb);
            return fb;
        }

        const text = getTextFromGeminiResponse(data);
        console.log("✅ Gemini raw text:", text);

        let parsed: any;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            console.error("❌ JSON.parse 실패. raw text:", text);
            const fb = postProcess(fallbackPlan(goal, duration));
            setCached(goal, duration, fb);
            return fb;
        }

        if (!Array.isArray(parsed)) {
            const fb = postProcess(fallbackPlan(goal, duration));
            setCached(goal, duration, fb);
            return fb;
        }

        const cleaned: NanoTask[] = parsed.map((t: any, idx: number) => ({
            id: String(t?.id ?? idx + 1),
            text: String(t?.text ?? ""),
            isFirstStep: Boolean(t?.isFirstStep ?? false),
        }));

        if (cleaned.length > 0) cleaned[0].isFirstStep = true;

        const finalTasks = postProcess(cleaned);

        // 너무 적게 나오면 fallback 섞어서 최소 품질 보장
        if (finalTasks.length < 5) {
            const fb = postProcess(fallbackPlan(goal, duration));
            const merged = postProcess([...finalTasks, ...fb]);
            setCached(goal, duration, merged);
            return merged;
        }

        setCached(goal, duration, finalTasks);
        return finalTasks;
    } catch (e) {
        console.error("❌ Gemini 호출 자체 실패 → fallback 사용", e);
        const fb = postProcess(fallbackPlan(goal, duration));
        setCached(goal, duration, fb);
        return fb;
    }
}
