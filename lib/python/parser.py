import re
import json
import sys

def parse_kakao_talk(text):
    messages = []
    
    # PC format: [Sender] [Time] Message
    pc_pattern = re.compile(r'\[(.+?)\]\s\[(오전|오후)\s(\d{1,2}:\d{2})\]\s(.+)')
    
    # Mobile format (Korean): 2023년 10월 24일 오후 8:10, 홍길동 : 안녕하세요
    mobile_ko_pattern = re.compile(r'(\d{4}년\s\d{1,2}월\s\d{1,2}일)\s(오전|오후)\s(\d{1,2}:\d{2}),\s(.+?)\s:\s(.+)')
    
    # Mobile format (Dots): 2023. 10. 24. 20:10, 홍길동 : 안녕하세요
    mobile_dot_pattern = re.compile(r'(\d{4}\.\s\d{1,2}\.\s\d{1,2}\.\s\d{1,2}:\d{2}),\s(.+?)\s:\s(.+)')
    
    lines = text.splitlines()
    # Optimization: Process only the last 50,000 lines if the file is too large
    # This helps stay within Vercel timeout limits as per Phase 3 instructions
    if len(lines) > 50000:
        lines = lines[-50000:]
        
    current_date = None
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Date headers
        date_header = re.search(r'-+\s*(\d{4}.+?\d{1,2}.+?\d{1,2}일?)\s*-+', line)
        if date_header:
            current_date = date_header.group(1).strip()
            continue
            
        # Mobile Korean
        m_ko = mobile_ko_pattern.search(line)
        if m_ko:
            date, ampm, time, sender, message = m_ko.groups()
            messages.append({
                "date": date.strip(),
                "time": f"{ampm} {time}",
                "sender": sender.strip(),
                "message": message
            })
            continue
            
        # Mobile Dot
        m_dot = mobile_dot_pattern.search(line)
        if m_dot:
            full_time, sender, message = m_dot.groups()
            # Safe handling of time parts for mobile dot format
            time_parts = full_time.split(" ")
            if len(time_parts) >= 4:
                date_str = " ".join(time_parts[:3])
                time_str = time_parts[3]
            else:
                date_str = current_date
                time_str = full_time
                
            messages.append({
                "date": date_str,
                "time": time_str,
                "sender": sender.strip(),
                "message": message
            })
            continue
            
        # PC format
        m_pc = pc_pattern.search(line)
        if m_pc:
            sender, ampm, time, message = m_pc.groups()
            messages.append({
                "date": current_date,
                "time": f"{ampm} {time}",
                "sender": sender.strip(),
                "message": message
            })
            continue
            
        # Multi-line
        if messages:
            messages[-1]["message"] += "\n" + line

    return messages

if __name__ == "__main__":
    # Force UTF-8 for stdout
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
        
    # For testing or calling from Node.js
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
    else:
        # Read from stdin if no arg - forcing UTF-8
        input_text = sys.stdin.buffer.read().decode('utf-8', errors='replace')
        
    result = parse_kakao_talk(input_text)
    sys.stderr.write(f"DEBUG: Parsed {len(result)} messages\n")
    print(json.dumps(result, ensure_ascii=False))
