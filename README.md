# Лешников разсадник „Турия“ — пакет за GitHub Pages

Пълен статичен сайт на български и английски, с автоматично настройване
на SEO адресите според действителния адрес на GitHub Pages. `index.html`
е в корена; `assets` е до него. Включени са актуалните поправки по функциите.

## Условия на услугата

GitHub Pages ограничава сайтове, насочени основно към търговски сделки.
Този технически пакет не е потвърждение, че GitHub одобрява конкретния
търговски каталог. За потвърждение се обърнете към GitHub Support;
алтернативата е хостинг доставчик, позволяващ този вид сайт.
https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

## Публикуване — следвай точно тези настройки

1. Разархивирай целия ZIP. Не отваряй/качвай отделни файлове от неразархивиран ZIP.
2. В GitHub създай ново хранилище `razsadnik-turia`: Public, с добавен README,
   основен клон `main`. Така Settings е достъпно още преди качването.
3. Отвори Settings → Pages → Build and deployment → Source → **GitHub Actions**.
   За този пакет НЕ избирай „Deploy from a branch“.
4. Върни се в Code → Add file → Upload files.
5. Качи СЪДЪРЖАНИЕТО на разархивираната папка. На едно ниво трябва да бъдат:
   `index.html`, `assets/`, `tools/`, `site-config.json`, `website-files.json`,
   CSS/JS файловете, всички други HTML страници и `.github/workflows/deploy.yml`.
   Не качвай цяла допълнителна външна папка над тях. Натисни Commit changes.
6. Увери се, че в GitHub има папка `.github`, а в нея `workflows/deploy.yml`.
   Ако браузърът не я качи, избери Add file → Create new file, напиши името
   `.github/workflows/deploy.yml` и постави съдържанието на файла deploy.yml
   от същата папка в архива. Commit changes.
7. Отвори Actions → Publish website. След успешното изпълнение линкът се вижда
   в Settings → Pages и в deployment-а github-pages.
8. Ако автоматичната задача още не е тръгнала след включването на Pages,
   отвори Actions → Publish website → Run workflow → main → Run workflow.

Страницата на ХРАНИЛИЩЕТО github.com/име/razsadnik-turia не е самият сайт.
Публичният адрес ще е https://ИМЕ.github.io/razsadnik-turia/.
Не отваряй отделен HTML файл през Code → Raw като работещия сайт.

## Какво настройва пакетът

При публикацията GitHub дава действителния Pages URL. `tools/build.py` сменя
всички canonical, hreflang, JSON-LD, sitemap и Open Graph адреси заедно.
Запазва относителните връзки към снимки, CSS, JavaScript и останалите страници.
Така работи както в подпапката /razsadnik-turia/, така и на собствен домейн,
ако той бъде конфигуриран правилно в Settings → Pages.

Няма пароли или лични токени. Използва се стандартният временен GITHUB_TOKEN
на Actions. Не е нужно да добавяш свои secrets за тази настройка.
Файлът CNAME не е добавен, защото още не е избран и конфигуриран домейн.

## Ако не работи

- 404: провери Public, клон main, Settings → Pages → GitHub Actions и зелена
  задача Publish website. Увери се, че index.html не е затворен в още една папка.
- Няма снимки/дизайн: провери дали assets и всички CSS/JS са качени. Отваряй
  публикувания github.io адрес, не github.com адреса на хранилището.
- Няма автоматична задача: липсва .github/workflows/deploy.yml или Actions е
  забранено в хранилището.
- Configure Pages дава грешка: първо включи GitHub Actions като източник
  в Settings → Pages, после Run workflow отново.
- Червена задача: отвори я и изпрати текста на грешката или линка към нея.

Пакетът е проверен локално, но не е публикуван в твой GitHub профил и реалната
GitHub Actions задача може да се потвърди чак след качването и настройката.
Сегашният публикуван сайт не е променян.
