import json
import os

log_file = r'C:\Users\Sandhra Shaji\.gemini\antigravity-ide\brain\bfa9b982-90ad-4091-babf-80a8e0d8086f\.system_generated\logs\transcript.jsonl'
files_to_recover = ['Dashboard.tsx', 'Login.tsx', 'Patients.tsx']
found = {}

print("Reading log...")
with open(log_file, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            step = json.loads(line)
            content = step.get('content', '')
            if content and isinstance(content, str):
                if 'File Path: `file://' in content or 'File Path: ' in content:
                    for filename in files_to_recover:
                        if '/' + filename in content or '\\\\' + filename in content or '%20' + filename in content or filename in content.split('\n')[2]:
                            found[filename] = content
                            print(f'Found {filename} in view_file output')
                            
            if 'tool_calls' in step:
                for call in step['tool_calls']:
                    if call.get('name') == 'write_to_file':
                        args = call.get('args', {})
                        target = str(args.get('TargetFile', ''))
                        for filename in files_to_recover:
                            if filename in target:
                                code = args.get('CodeContent', '')
                                if isinstance(code, str) and code.startswith('"') and code.endswith('"'):
                                    try:
                                        code = json.loads(code)
                                    except:
                                        pass
                                found[filename] = code
                                print(f'Found {filename} in write_to_file')
                                
        except Exception as e:
            pass

import re

for f_name, content in found.items():
    out_path = 'recovered_' + f_name + '.txt'
    
    if 'The following code has been modified' in content:
        # Extract source code from view_file format
        lines = content.split('\n')
        source_code = []
        parsing = False
        for l in lines:
            if l.startswith('The following code has been modified'):
                parsing = True
                continue
            if l.startswith('The above content shows'):
                parsing = False
                continue
            if parsing:
                # Remove line numbers like "12: "
                match = re.match(r'^\d+:\s?(.*)$', l)
                if match:
                    source_code.append(match.group(1))
                else:
                    source_code.append(l)
        
        final_content = '\n'.join(source_code)
    else:
        final_content = content
        
    with open(out_path, 'w', encoding='utf-8') as out_f:
        out_f.write(final_content)
    print(f'Saved {out_path}')
