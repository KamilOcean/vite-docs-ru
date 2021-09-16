# Server-Side Rendering

:::warning Экспериментальная функция
Поддержка SSR всё ещё находится в экспериментальной стадии и вы можете столкнуться с багами не поддерживаемыми случаями. Продолжайте на свой страх и риск.
:::

:::tip Заметка
SSR спецификация относится к front-end фреймворкам (например, React, Preact, Vue, и Svelte), которые поддерживают запуск одного и того же приложения на Node.js, pre-rendering приложения в HTML и в завершении hdrating (гидратации) приложения на клиенте. Если вы идите интеграции с традиционными server-side фреймворками, взгляните сюда [Backend Integration guide](./backend-integration).

Текущее руководство также предполагает, что у вас уже есть предыдущий опыт работы с SSR в вашем любимом фреймворке, и этот гайд фокусируется только на Vite-specific деталях интеграции.
:::

:::warning Low-level API
Это low-level (низкоуровневое) API предназначенное для авторов библиотек и фреймворков. Если ваша цель создать приложение, то сначала поищите higher-level (высокоуровневое решение) SSR плагины и инструменты в разделе [Awesome Vite SSR](https://github.com/vitejs/awesome-vite#ssr). Тем не менее многие приложения успешно создаются непосредственно поверх нативного низкоуровнего (low-level) API Vite.
:::

:::tip Помощь
Если у вас есть вопросы, сообщество придёт к вам на помощь в [Vite Discord's #ssr channel](https://discord.gg/PkbxgzPhJv).
:::

## Примеры проектов

Vite предоставляет built-in (встроенную) поддержку для server-side rendering (SSR). Vite playground содержит пример SSR настройки для Vue 3 и React, что может быть использовано как референсы для текущего руководства:

- [Vue 3](https://github.com/vitejs/vite/tree/main/packages/playground/ssr-vue)
- [React](https://github.com/vitejs/vite/tree/main/packages/playground/ssr-react)

## Source Structure

Типичное SSR приложение будет содержать следующую структуру файлов:

```
- index.html
- src/
  - main.js          # exports env-agnostic (universal) app code
  - entry-client.js  # mounts the app to a DOM element
  - entry-server.js  # renders the app using the framework's SSR API
```

`index.html` должен ссылаться на `entry-client.js` и включать в себя placeholder, куда будет вставлена сгенерированная сервером (server-rendered) разметка:

```html
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

Вы можете использовать любой placeholder на ваше усмотрение, вместо `<!--ssr-outlet-->`, любой, который может быть заменён.

## Условная логика

Если вам нужно выполнить условную логику опираясь на том, где мы, на SSR или на клиенте, вы можете использовать это

```js
if (import.meta.env.SSR) {
  // ... server only logic
}
```

Это статично замениться во время сборки, поэтому это позволяет tree-shaking неиспользуемые ветки.

## Настраиваем Dev Server

Когда собирается SSR приложение, вы вероятно захотите иметь полный контроль над вашим главным сервером и отделить Vite от production окружения. Поэтому рекомендуется использовать Vite в режиме middleware. Вот пример с [express](https://expressjs.com/):

**server.js**

```js{17-19}
const fs = require('fs')
const path = require('path')
const express = require('express')
const { createServer: createViteServer } = require('vite')

async function createServer() {
  const app = express()

  // Создаём Vite сервер в middleware режиме. Это отключит собственный HTML Vite'а
  // serving logic and let the parent server take control.
  //
  // Если вы хотите использовать Vite's own HTML serving logic (используя Vite как
  // a development middleware), используйте вместо этого 'html'.
  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' }
  })
  // используйте vite's connect instance как middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // serve index.html - we will tackle this next
  })

  app.listen(3000)
}

createServer()
```

Здесь `vite` - это экземпляр [ViteDevServer](./api-javascript#vitedevserver). `vite.middlewares` - это экземпляр [Connect](https://github.com/senchalabs/connect), который может быть использован как middleware в любом connect-compatible Node.js фреймворке.

Следующий шаг - это реализация `*` обработчика, чтобы сёрвить server-rendered HTML:

```js
app.use('*', async (req, res) => {
  const url = req.originalUrl

  try {
    // 1. Read index.html
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8'
    )

    // 2. Применяем Vite HTML трансформации. Это заинжектит Vite HMR client, и
    //    также применит HTML трансформации из Vite плагинов, например, global preambles
    //    из @vitejs/plugin-react-refresh
    template = await vite.transformIndexHtml(url, template)

    // 3. Загружаем the server entry. vite.ssrLoadModule автоматически трансформирует
    //    ваш ESM исходный код для использования в Node.js! Здесь не нужен никакой бандлер,
    //    и предоставит эффективную инвалидацию, похожую на HMR.
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. render the app HTML. Это предполагает entry-server.js's exported `render`
    //    function calls appropriate framework SSR APIs,
    //    e.g. ReactDOMServer.renderToString()
    const appHtml = await render(url)

    // 5. Инжектим the app-rendered HTML в шаблон.
    const html = template.replace(`<!--ssr-outlet-->`, appHtml)

    // 6. Посылаем the rendered HTML обратно клиенту.
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // Если возникла какая-то ошибка, позволяем Vite fix the stracktrace so it maps back to
    // your actual source code.
    vite.ssrFixStacktrace(e)
    console.error(e)
    res.status(500).end(e.message)
  }
})
```

`dev` скрипт в `package.json` должен также быть заменён на использование server script:

```diff
  "scripts": {
-   "dev": "vite"
+   "dev": "node server"
  }
```

## Сборка для Production

Чтобы поставить SSR проект для production, нам нужно сделать следующее:

1. Создать клиентский build как нормальный (обычный);
2. Создать SSR build, который может быть напрямую загружен с помощью `require()` так что нам не нужно проходить через  Vite's `ssrLoadModule`;

Наши скрипты в `package.json` будут выглядеть так:

```json
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js "
  }
}
```

Обратите внимание на `--ssr` флаг, который показывает, что это SSR build. Также мы должны указать SSR entry.

Затем, в `server.js` файле нам нужно добавить некоторую production specific логику, с помощью проверки `process.env.NODE_ENV`:

- Вместо того, чтобы читать рутовый `index.html`, используйте `dist/client/index.html` как шаблон, поскольку он содержит правильные ссылки на ресурсы (asset) для клиентской сборки.

- Вместо `await vite.ssrLoadModule('/src/entry-server.js')`, используйте `require('./dist/server/entry-server.js')` (этот файл результат SSR сборки).

- Переместите создание и использование `vite` dev server'а за пределы dev-only условий в коде, затем, добавьте статичные  file serving middlewares, чтобы обрабатывать (сёрвить) файлы из `dist/client`.

Ссылки на [Vue](https://github.com/vitejs/vite/tree/main/packages/playground/ssr-vue) и [React](https://github.com/vitejs/vite/tree/main/packages/playground/ssr-react) демо для рабочих настроек.

## Generating Preload Directives

`vite build` поддерживает флаг `--ssrManifest`, который генерирует `ssr-manifest.json` в build output директорию:

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

Скрипт выше сгенерирует `dist/client/ssr-manifest.json` для клиентской сборки (Да, SSR manifest генерируется из client build потому что нам нужно маппить module IDs к клиентским файлам). Manifest содержит маппинги ID модулей к их связанным чанкам и ассетам (ресурсам).

Чтобы использовать манифест, фреймворки должны предоставить путь для сбора ID модулей компонентов, которые были использованы во время вызова server render'а.

`@vitejs/plugin-vue` поддерживает это из коробки и автоматически регистрирует используемые ID модули компонентов в связанном Vue SSR context:

```js
// src/entry-server.js
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// ctx.modules is now a Set of module IDs that were used during the render
```

В production ветке `server.js` мы должны прочитать и передать manifest в `render` функцию, которая экспортируется в `src/entry-server.js`. Это предоставит нам достаточную информацию для рендера preload directives для файлов используемых в async рутах! Смотрите [demo source](https://github.com/vitejs/vite/blob/main/packages/playground/ssr-vue/src/entry-server.js) для полного примера.

## Pre-Rendering / SSG

Если руты (routes) и необходимые для них данные определены заранее, мы можем сделать pre-render этих путей в статичный HTML используя ту же логику, как и в production SSR. Это также можно рассматривать как вид Static-Site Generation (SSG). Смотрите [demo pre-render script](https://github.com/vitejs/vite/blob/main/packages/playground/ssr-vue/prerender.js) для наглядного примера.

## SSR Externals

Множество зависимостей поставляются как файлы ESM и CommonJS. Когда запускается SSR, зависимость, которая предоставляет сборку CommonJS и может быть "экстернализирована" из Vite's SSR transform / module system, чтобы улучшить скорость и dev и build. Например, вместо того, чтобы извлекать в pre-bundled ESM версию React и затем трансформировать её обратно для Node.js-совместимым, более эффективно использовать вместо этого `require('react')`. Это также значительно увеличивает скорость сборки SSR bundle.

Vite выполняет автоматическую SSR экстернализацию с помощью следующей эвристики:

- Если у зависимости резолвнутый ESM entry point и его дефолтный Node entry point различные, вероятно дефолтный Node entry - это CommonJS build, который может быть экстернализирован. Например, `vue` будет автоматически экстернализирован потому что он поставляется как в ESM, так и в CommonJS сборках.

- В противном случае, Vite проверит, содержит ли entry point валидный ESM синтаксис - если нет, пакет вероятнее всего в формате CommonJS и будет экстернализирован. Например, `react-dom` будет автоматически экстернализирован, потому что он имеет только один entry, которая в формате CommonJS.

Если эта эвристика приводит к ошибкам, вы можете вручную настроить внешние параметры SSR, используя параметры конфигурации `ssr.external` и`ssr.noExternal`.

В будущем эта эвристика, вероятно, будет улучшена, чтобы определять, включен ли в проекте `type:" module "`, так что Vite может также экстернализовать зависимости, которые поставляют сборки ESM, совместимые с Node, путем их импорта через динамический `import ()` во время SSR.

:::warning Работа с Aliases
Если вы настроили aliases, которые перенаправляют один пакет на другой, то вероятно вы захотите связать актуальные `node_modules` пакеты, чтобы это работало для SSR экстернелизированных зависимостей. И [Yarn](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias) и [pnpm](https://pnpm.js.org/en/aliases) поддерживают aliasing через `npm:` префикс.
:::

## SSR-specific Plugin Logic

Некоторые фреймворки, такие, как Vue или Svelte компилируют компоненты в разные форматы, в зависимости от того, пойдёт это на клиент или SSR. Чтобы поддерживать трансформаирование по условию, Vite передаёт дополнительный аргумент `ssr` в следующие хуки плагинов:

- `resolveId`
- `load`
- `transform`

**Пример:**

```js
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, ssr) {
      if (ssr) {
        // perform ssr-specific transform...
      }
    }
  }
}
```

## SSR Target

По умолчанию, target для SSR сборки - это node environment, но вы также можете запустить сервер в Web Worker'е. Packages entry resolution разный для каждой платформы. Вы можете настроить target как Web Worker установив `ssr.target` в значение`'webworker'`.

## SSR Bundle

В некоторых случаях, таких как `webworker` runtimes, вы возможно захотите собрать ваш SSR build в один JavaScript файл. Вы можете активировать это поведение установив `ssr.noExternal` в значение `true`. Это сделает две вещи:

- Обработает все зависимости как `noExternal`
- Выведет ошибку, если импортируются какие-либо встроенные (built-in) Node.js модули
