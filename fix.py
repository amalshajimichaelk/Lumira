import os
import glob
import json

files = glob.glob('src/pages/*.tsx')
print('Fixing files:', files)
for f in files:
    content = open(f, 'r', encoding='utf-8').read()
    
    # If the file starts with quotes, it's stringified JSON
    if content.startswith('"') and content.endswith('"'):
        try:
            content = json.loads(content)
        except Exception as e:
            print(f'Error json parsing {f}: {e}')
            
    # Also fix the literal backslashes we added before!
    content = content.replace('\\`', '`').replace('\\$', '$')
    
    with open(f, 'w', encoding='utf-8') as out:
        out.write(content)
print('Done!')
