import re
import json
import sys

def parse_kakao_talk(text):
    # KakaoTalk formats vary by device (Android, iOS, PC) and language
    # Android/iOS (Korean): 2023년 10월 24일 오후 8:10, 홍길동 : 안녕하세요
    # PC (Korean): [홍길동] [오후 8:10] 안녕하세요
    
    messages = []
    
    # Simple regex for PC/Desktop format: [Sender] [Time] Message
    pc_pattern = re.compile(r'^\[(.+?)\]\s\[(오전|오후)\s(\d{1,2}:\d{2})\]\s(.+)$')
    
    # Simple regex for Mobile format: yyyy년 mm월 dd일 오후 hh:mm, Sender : Message
    # Note: Date headers usually appear separately: --------------- 2023년 10월 24일 화요일 ---------------
    mobile_pattern = re.compile(r'^(\d{4}년 \d{1,2}월 \d{1,2}일 (오전|오후) \d{1,2}:\d{2}),\s(.+?)\s:\s(.+)$')
    
    current_date = None
    
    lines = text.splitlines()
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check for date headers: --------------- 2023년 10월 24일 화요일 ---------------
        date_header = re.search(r'-+ (\d{4}년 \d{1,2}월 \d{1,2}일) .+ -+', line)
        if date_header:
            current_date = date_header.group(1)
            continue
            
        # Try Mobile format
        mobile_match = mobile_pattern.match(line)
        if mobile_match:
            full_time, ampm, time, sender, message = mobile_match.groups()
            messages.append({
                "date": full_time.split(" ")[0] + " " + full_time.split(" ")[1] + " " + full_time.split(" ")[2],
                "time": f"{ampm} {time}",
                "sender": sender,
                "message": message
            })
            continue
            
        # Try PC format
        pc_match = pc_pattern.match(line)
        if pc_match:
            sender, ampm, time, message = pc_match.groups()
            messages.append({
                "date": current_date, # Uses the last detected date header
                "time": f"{ampm} {time}",
                "sender": sender,
                "message": message
            })
            continue
            
        # If line doesn't match and we have messages, it might be a multi-line message
        if messages and not (line.startswith('-') or line.startswith('[')):
            messages[-1]["message"] += "\n" + line

    return messages

if __name__ == "__main__":
    # For testing or calling from Node.js
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
    else:
        # Read from stdin if no arg
        input_text = sys.stdin.read()
        
    result = parse_kakao_talk(input_text)
    print(json.dumps(result, ensure_ascii=False))
