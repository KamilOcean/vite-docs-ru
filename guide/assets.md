# Обработка статичных ресурсов (Static Asset Handling)

- Связанный раздел: [Public Base Path](./build#public-base-path)
- Связанный раздел: [`assetsInclude` config option](/config/#assetsinclude)

## Импортирование ресурсов как URL

> Примечание переводчика. Далее в документации термин "asset" и ресурсы взаимозаменяем. В устной речи разработчики чаще пользуются английским словом, чем "ресурсы"

Импортирование статических ресурсов вернёт правильный public URL, когда он будет запрошен:

```js
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Например, `imgUrl` станет строкой `/img.png` во время разработки (dev build), и строкой `/assets/img.2d8efhg.png` в production сборке.

Это поведение очень похоже на `file-loader` в webpack. Различие только в том, что импорт может быть использован как с абсолютным путём (основываясь на вашей корневой директории во время разработки), так и с относительным путём (relative path).

- `url()` ссылки в CSS обрабатываются таким же образом.

- Если Вы используете Vue plugin, ссылки на assets во Vue SFC шаблонах автоматически конвертируются в импорты.

- Общеиспользуемые форматы картинок, медиа, и шрифтов распознаются как assets автоматически. Вы можете расширить этот внутренний список используя [`assetsInclude` option](/config/#assetsinclude).

- Ресурсы, на которые есть ссылки, встраиваются как часть графа assets (build assets graph), у них будут хэшированные имена файлов и они могут обрабатываться плагинами для их оптимизации.

- Assets размеры которых в байтах меньше чем [`assetsInlineLimit` option](/config/#build-assetsinlinelimit) будут вставлены инлайном как base64 data URL.

### Явные URL импорты

Ресурсы, формат которых не включен во внутренний список или в `assetsInclude` могут быть явно импортированы как URL используя суффикс `?url`. Это пригодится, например, для импорта [Houdini Paint Worklets](https://houdini.how/usage).

```js
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### Импортирование Asset как String

Ресурсы могут быть импортированы как строки с помощью суффикса `?raw`.

```js
import shaderString from './shader.glsl?raw'
```

### Импортирование скрипта как Worker

Скрипты могут быть импортированы как web worker'ы с суффиксами `?worker` или `?sharedworker`.

```js
// Отдельный chunk в production сборке
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js
// sharedworker
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js
// Инлайном как base64 строка
import InlineWorker from './shader.js?worker&inline'
```

Ознакомьтесь с разделом [Web Worker](./features.md#web-workers) для более детальной информации.

## Директория `public`

Если у вас есть assets, которые:

- Никогда не используются в исходном коде (например, `robots.txt`)
- Должны содержать конкретное имя файла (без хеширования)
- ...или вы просто не хотите сначала импортировать ресурс, чтобы только получить его URL (если вам нужен только URL ресурса)

Тогда вы можете разместить ресурс в специальной директории `public` в вашем корневом каталоге. Assets в этой директории будут сёрвиться через корневой путь `/` во время dev разработки и будут скопированы в `dist` директорию корневого каталога как есть.

По умолчанию используется директория `<root>/public`, но вы можете настроить это через [`publicDir` option](/config/#publicdir).

Обратите внимание:

- Вы всегда должны ссылаться на ресурсы `public` используя абсолютный рутовый путь - например, ссылка на файл `public/icon.png` должна быть такой ссылкой в исходном коде `/icon.png`.
- Assets в `public` не могут быть импортированы в JavaScript.

## new URL(url, import.meta.url)

[import.meta.url](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta) это нативная ESM фича, которая предоставляет URL адрес текущего модуля. Объединив это с нативным [URL constructor](https://developer.mozilla.org/en-US/docs/Web/API/URL), мы можем получить полный, резолвнутый (resolved) URL статического asset используя относительный путь из JavaScript модуля:

```js
const imgUrl = new URL('./img.png', import.meta.url)

document.getElementById('hero-img').src = imgUrl
```

Это работает нативно в современных браузерах - на самом деле, Vite'у вовсе не обязательно обрабатывать этот код на протяжении всего процесса разработки!

Этот pattern также поддерживает динамичные URL через шаблонные строки (template literals):

```js
function getImageUrl(name) {
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

Во время production сборки, Vite будет выполнять необходимые трансформации, чтобы URL адреса всё ещё указывали на правильное местонахождение файлов, даже после сборки и хеширования ресурсов.

::: warning Note: Не используйте это с SSR
Этот паттерн не сработает, если Вы используете Vite для Server-Side rendering'а, потому что `import.meta.url` имеет различную семантику в браузерах и Node.js. Сервер сборка также не может заранее определить URL адресс хоста клиента.
:::
