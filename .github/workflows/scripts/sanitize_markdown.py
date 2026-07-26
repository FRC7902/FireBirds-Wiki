import re, os

for root, dirs, files in os.walk('website/docs'):
    for f in files:
        if f.endswith('.md'):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as fh:
                    content = fh.read()
                cleaned = re.sub(r'[^\x20-\x7E\x0A\x0D\x09\xA0-\xFF\u0100-\uFFFF]', '', content)
                if cleaned != content:
                    with open(path, 'w', encoding='utf-8') as fh:
                        fh.write(cleaned)
                    print(f'  Cleaned: {path}')
            except Exception as e:
                print(f'  Error processing {path}: {e}')