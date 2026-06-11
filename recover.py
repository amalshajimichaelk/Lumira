import json
import os

log_file = r'C:\Users\Sandhra Shaji\.gemini\antigravity-ide\brain\bfa9b982-90ad-4091-babf-80a8e0d8086f\.system_generated\logs\transcript.jsonl'
files_to_recover = ['Appointments.tsx', 'Dashboard.tsx', 'Departments.tsx', 'Doctors.tsx', 'Login.tsx', 'Patients.tsx', 'Revenue.tsx', 'Settings.tsx']
found = {}

print("Reading log...")
with open(log_file, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            step = json.loads(line)
            
            # Check for view_file output in USER_INPUT (where tool results are sent)
            if step.get('type') == 'USER_INPUT':
                content = step.get('content', '')
                if 'File Path: ' in content:
                    for filename in files_to_recover:
                        if '/' + filename in content or '\\\\' + filename in content:
                            # Extract the file content starting after "The following code has been modified..."
                            # Or just save the raw content and we can extract it manually
                            found[filename] = content
                            print(f'Found {filename} in view_file output')
            
            # Check for write_to_file tool calls in PLANNER_RESPONSE
            if step.get('type') == 'PLANNER_RESPONSE' and 'tool_calls' in step:
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

for f_name, content in found.items():
    out_path = 'recovered_' + f_name + '.txt'
    with open(out_path, 'w', encoding='utf-8') as out_f:
        out_f.write(content)
    print(f'Saved {out_path}')
