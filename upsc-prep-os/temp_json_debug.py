import json
import pathlib
import sys

path = pathlib.Path('Polity-question.json')
text = path.read_text(encoding='utf8')
print('total length', len(text))
print('last 50 chars', repr(text[-50:]))
print('last 20 chars', repr(text[-20:]))
print('last 10 chars', repr(text[-10:]))
print('last 5 lines:')
for line in text.splitlines()[-5:]:
    print(repr(line))

try:
    json.loads(text)
    print('JSON valid')
except Exception as e:
    print('JSON error', type(e).__name__, e)

print('\n--- element scan ---')
text = text.lstrip()
assert text[0] == '['
decoder = json.JSONDecoder()
idx = 1
count = 0
while True:
    if idx >= len(text):
        print('EOF reached', idx)
        break
    text2 = text[idx:]
    text2l = text2.lstrip()
    idx += len(text2) - len(text2l)
    if not text2l:
        print('empty after stripping', idx)
        break
    if text2l[0] == ']':
        print('closed at', idx)
        break
    try:
        obj, end = decoder.raw_decode(text2l)
    except Exception as e:
        print('raw_decode failed at idx', idx, 'error', e)
        sys.exit(0)
    count += 1
    idx += end
    rest = text[idx:]
    restl = rest.lstrip()
    idx += len(rest) - len(restl)
    print('after obj', count, 'idx', idx, 'rest repr', repr(rest[:40]), 'restl repr', repr(restl[:40]))
    if restl.startswith(','):
        idx += 1
        continue
    if restl.startswith(']'):
        print('closed after', count, 'objects at', idx)
        break
    print('unexpected after object', count, repr(restl[:40]))
    break
