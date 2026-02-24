export interface ChatMessage {
    date: string | null;
    time: string;
    sender: string;
    message: string;
}

export function parseKakaoTalk(text: string): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // PC format: [Sender] [Time] Message
    const pcPattern = /^\[(.+?)\]\s\[(오전|오후)\s(\d{1,2}:\d{2})\]\s([\s\S]+)$/;

    // Mobile format (Korean): 2023년 10월 24일 오후 8:10, 홍길동 : 안녕하세요
    const mobileKoPattern = /^(\d{4}년\s\d{1,2}월\s\d{1,2}일)\s(오전|오후)\s(\d{1,2}:\d{2}),\s(.+?)\s:\s([\s\S]+)$/;

    // Mobile format (Dots): 2023. 10. 24. 20:10, 홍길동 : 안녕하세요
    const mobileDotPattern = /^(\d{4}\.\s\d{1,2}\.\s\d{1,2}\.\s\d{1,2}:\d{2}),\s(.+?)\s:\s([\s\S]+)$/;

    // Date header: ---------- 2023년 10월 24일 화요일 ----------
    const dateHeaderPattern = /^-+\s*(\d{4}.+?\d{1,2}.+?\d{1,2}일?)\s*-+/;

    const lines = text.split(/\r?\n/);

    // Optimization: Process only the last 50,000 lines if the file is too large
    let processedLines = lines;
    if (lines.length > 50000) {
        processedLines = lines.slice(-50000);
    }

    let currentDate: string | null = null;

    for (const line of processedLines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Date header check
        const dateMatch = trimmedLine.match(dateHeaderPattern);
        if (dateMatch) {
            currentDate = dateMatch[1].trim();
            continue;
        }

        // Mobile Korean format check
        const mKo = trimmedLine.match(mobileKoPattern);
        if (mKo) {
            const [, date, ampm, time, sender, message] = mKo;
            messages.push({
                date: date.trim(),
                time: `${ampm} ${time}`,
                sender: sender.trim(),
                message: message
            });
            continue;
        }

        // Mobile Dot format check
        const mDot = trimmedLine.match(mobileDotPattern);
        if (mDot) {
            const [, fullTime, sender, message] = mDot;
            const timeParts = fullTime.split(" ");
            let dateStr = currentDate;
            let timeStr = fullTime;

            if (timeParts.length >= 4) {
                dateStr = timeParts.slice(0, 3).join(" ");
                timeStr = timeParts[3];
            }

            messages.push({
                date: dateStr,
                time: timeStr,
                sender: sender.trim(),
                message: message
            });
            continue;
        }

        // PC format check
        const mPc = trimmedLine.match(pcPattern);
        if (mPc) {
            const [, sender, ampm, time, message] = mPc;
            messages.push({
                date: currentDate,
                time: `${ampm} ${time}`,
                sender: sender.trim(),
                message: message
            });
            continue;
        }

        // Multi-line message check: append to the last message if current line doesn't match any pattern
        if (messages.length > 0) {
            messages[messages.length - 1].message += "\n" + line;
        }
    }

    return messages;
}
