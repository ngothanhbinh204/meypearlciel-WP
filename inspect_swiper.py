with open(r'd:\datamain\Local_Sites_D\meypearlciel\app\public\wp-content\themes\canhcamtheme\src\plugins\swiper.min.js', 'r', encoding='utf-8') as f:
    content = f.read()
print('=== FIRST 400 ===')
print(repr(content[:400]))
print('=== LAST 400 ===')
print(repr(content[-400:]))
