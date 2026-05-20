with open(r'dist\js\core.min.js', 'rb') as f:
    content = f.read()
print(f'core.min.js size: {len(content)} bytes')
# Search for Swiper (case-sensitive)
idx = content.find(b'Swiper')
print(f'First "Swiper" occurrence at byte: {idx}')
if idx >= 0:
    print(f'Context: {content[max(0,idx-30):idx+60]}')
# How many times does "Swiper" appear?
count = content.count(b'Swiper')
print(f'Total "Swiper" occurrences: {count}')
# Show last 200 bytes
print(f'Last 200 bytes: {content[-200:]}')
