import re

# Check last 500 chars of core.min.js
path_core = r'd:\datamain\Local_Sites_D\meypearlciel\app\public\wp-content\themes\canhcamtheme\dist\js\core.min.js'
try:
    with open(path_core, 'r', encoding='utf-8') as f:
        core = f.read()
    print('=== core.min.js last 300 chars ===')
    print(core[-300:])
    print('\n=== core.min.js first 200 chars ===')
    print(core[:200])

    # Search for Swiper export
    matches = re.findall(r'.{0,30}[Ss]wiper.{0,30}', core[-2000:])
    print('\n=== Swiper mentions in last 2000 chars ===')
    for m in matches[:10]:
        print(m)
except Exception as e:
    print(f"Error reading core.min.js: {e}")

# Check plugins swiper.min.js last 300 chars
path_swiper = r'd:\datamain\Local_Sites_D\meypearlciel\app\public\wp-content\themes\canhcamtheme\src\plugins\swiper.min.js'
try:
    with open(path_swiper, 'r', encoding='utf-8') as f:
        swiper_plugin = f.read()
    print('\n=== swiper.min.js last 300 chars ===')
    print(swiper_plugin[-300:])
except Exception as e:
    print(f"Error reading swiper.min.js: {e}")
