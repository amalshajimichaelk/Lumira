import os
import glob
import json

files = glob.glob('src/pages/*.tsx')
print('Fixing files:', files)
for f in files:
    content = open(f, 'r', encoding='utf-8').read()
    
    # decode as many times as needed!
    while content.startswith('"') and content.endswith('"'):
        try:
            new_content = json.loads(content)
            if isinstance(new_content, str):
                content = new_content
            else:
                break
        except Exception as e:
            print(f'Error json parsing {f}: {e}')
            break
            
    # Also fix the literal backslashes we added before!
    content = content.replace('\\`', '`').replace('\\$', '$')
    
    with open(f, 'w', encoding='utf-8') as out:
        out.write(content)
print('Done!')
