# Конфигурация Vite

## Config File

### Config File Resolving (обнаружение конфига)

Когда вы запускаете `vite` из командной строки, Vite попытается автоматически найти конфиг файл с именем `vite.config.js` внутри [корневой директории вашего проекта](/guide/#index-html-and-project-root).

В самом базовом виде конфиг файл выглядит как-то так:

```js
// vite.config.js
export default {
  // config options
}
```

Заметьте, Vite поддерживает использование синтаксиса ES модулей в конфиг файле, даже если в проекте не используются нативные Node ESM через `type: "module"`. В этом случае, конфиг файл авто преобрабатывается до загркзуки.

Вы также можете явно указать, какой конфиг файл нужно использовать с помощью CLI опции `--config` (резолвится относительно `cwd`):

```bash
vite --config my-config.js
```

### Config Intellisense

Поскольку Vite поставляется с TypeScript typings, вы можете использовать intellisense в вашей IDE с подсказками типов от jsdoc:

```js
/**
 * @type {import('vite').UserConfig}
 */
const config = {
  // ...
}

export default config
```

Как альтернативный вариант, вы можете использовать `defineConfig` хелпер, который должен предоставлять intellisense без написания jsdoc аннотаций:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

Vite также на прямую поддерживает TS конфиг файлы. Вы можете также использовать `vite.config.ts` с `defineConfig` хелпером.

### Config с условиями

Если в конфиге нужно использовать условия, зависящие от команды (`serve` или `build`) или же вы используете [mode](/guide/env-and-mode), то вы можете экспортировать функцию с блоками return:

```js
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    return {
      // serve specific config
    }
  } else {
    return {
      // build specific config
    }
  }
})
```

### Ассинхронный Config

Если конфиг должен вызвать ассинхронную функцию, то вы можете экспортировать его (конфиг) как async function:

```js
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // build specific config
  }
})
```

## Общие опции (для Server и Build)

### root

- **Type:** `string`
- **Default:** `process.cwd()`

  Корневая директория проекта (где располагается `index.html`). Может быть абсолютным путём, или относительным к расположению где лежит сам конфиг файл.  

  Смотрите [Project Root](/guide/#index-html-and-project-root) для большей информации.

### base

- **Type:** `string`
- **Default:** `/`

  Base public путь, когда сервер работает в development или production. Валидные значения:

  - Абсолютный URL путь, например, `/foo/`
  - Полный URL, например, `https://foo.com/`
  - Пустая строка или `./` (для embedded deployment)

  Смотрите [Public Base Path](/guide/build#public-base-path) для большей информации.

### mode

- **Type:** `string`
- **Default:** `'development'` для serve, `'production'` для build

  Указание этого параметра в конфиге перезапишет mode используемый по умолчанию в **serve и build**. Это значение также может быть перезаписано через параметр командной строки `--mode`.

  Смотрите [Env Variables and Modes](/guide/env-and-mode) для большей информации.

### define

- **Type:** `Record<string, string>`

  Определяет глоальную замену констант. Записи будут определяться как глобальные во время dev разработки и статически заменяться во время build.

  - Начиная с версии `2.0.0-beta.70`, строковые значения спользуются как обычные выражениия (raw expressions), поэтому при определении строковой константы, её нужно явно написать в кавычках (например с `JSON.stringify`).

  - Замены выполняются только тогда, когда совпадение заключено в границы слова (word boundaries) (`\b`).

  Поскольку он реализован как простая замена текста без какого-либо синтаксического анализа, мы рекомендуем использовать `define` только для CONSTANTS.

  Например, `process.env.FOO` и `__APP_VERSION__` хорошо подходят. Но `process` или `global` не следует использовать в этом случае. Вместо этого переменные могут быть поставлены (shimmed) или polyfilled.

### plugins

- **Type:** ` (Plugin | Plugin[])[]`

  Массив плагинов для использования. Falsy значения будут проигнорированы и массив плагинов будет выровнен (flattened). Смотрите [Plugin API](/guide/api-plugin) для получения большей информации о Vite плагинах.

### publicDir

- **Type:** `string | false`
- **Default:** `"public"`

  Директория, из которой сёрвятся необрабатываемые статичные ресурсы (static assets). Файлы в этой директории сёрвятся через `/` во время dev разработки и копируются в корень `outDir` во время сборки (build), и всегда отдаются сервером или копируются как есть, без каких-либо трансформаций и изменений. Значение может быть или абсолютным системным путём (absolute file system path) или относительным к корню проекта (relative to project root).

  Определение `publicDir` как `false` отключает этот функционал.

  Смотрите [The `public` Directory](/guide/assets#the-public-directory) для большей информации.

### cacheDir

- **Type:** `string`
- **Default:** `"node_modules/.vite"`

  Директория для сохранения кешированных файлов. Файлы в этой директории - это заранее собранные зависимости проекта (pre-bundled deps) или какие-нибудь другие закешированные файлы, сгенерированные с помощью vite, кеш которых, может повлиять на улучшение производительности. Вы можете использовать флаг `--force` или удалить директорию вручную чтобы перегенерировать кешируемые файлы. Значение может быть или абсолютным системным путём (absolute file system path) или относительным путём к корню проекта (path relative to project root).

### resolve.alias

- **Type:**
  `Record<string, string> | Array<{ find: string | RegExp, replacement: string }>`

  Будет передано в `@rollup/plugin-alias` как его [entries option](https://github.com/rollup/plugins/tree/master/packages/alias#entries). Может быть объектом, или массивом пар `{ find, replacement }`.

  Когда вы связываете (aliasing - делаете алиасы) к file system paths, всегда используйте абсолютные пути. Относительные  alias значения будут использоваться как есть и не будут резолвнуты в file system paths.

  Более продвинутое кастомное разрешение может быть найдено тут [plugins](/guide/api-plugin).

### resolve.dedupe

- **Type:** `string[]`

  Если у вас есть дублированные копии одной и той же зависимости в вашем приложении (вероятно, из-за подъема или связанных пакетов в монорепозитории), используйте этот параметр, чтобы заставить Vite всегда резолвить перечисленные зависимости в одной и той же копии (из корня проекта).

### resolve.conditions

- **Type:** `string[]`

  Дополнительные позволенные условия (allowed condiitons), когда резолвится [Conditional Exports](https://nodejs.org/api/packages.html#packages_conditional_exports) из пакета.

  Пакет с условным экспортом может иметь следующие `exports` поля в своём `package.json` файле:

  ```json
  {
    "exports": {
      ".": {
        "import": "./index.esm.js",
        "require": "./index.cjs.js"
      }
    }
  }
  ```

  Здесь, `import` и `require` - "conditions" (условия). Conditions могут быть вложеными и следует указывать их от наиболее специфичных к наименее специфичным.

  Vite имеет список "allowed conditions" (позволенных условий) и он будет искать первое соответствие, которое есть в позволенном списке (allowed list). Дефолтные позволенные условия (allowed conditions), следующие: `import`, `module`, `browser`, `default`, и `production/development` в соответствие с текущим используемым mode (режимом). `resolve.conditions` конфиг параметр позволяет указать дополнительные позволенные условия (allowed conditions).

### resolve.mainFields

- **Type:** `string[]`
- **Default:** `['module', 'jsnext:main', 'jsnext']`

  Список полей в `package.json`, которые будут использоваться чтобы отыскать входную точку в пакете (package's entry point). Обратите внимание, этот параметр имеет более низкий приоритет, чем условные экспорты, резолвнутые из поля `exports`: если любой entry point успешно найден из `exports`, то данное mainFields поле будет проигнорировано.

### resolve.extensions

- **Type:** `string[]`
- **Default:** `['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']`

  Список расширений файлов, которые будут импортированы без расширений. Обратите внимание, **НЕ НАДО** исключать расширения для кастомных импортируемых типов (например, `.vue`) поскольку это может помешать вашей IDE и поддержке типов (type support).

### css.modules

- **Type:**

  ```ts
  interface CSSModulesOptions {
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: RegExp[]
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    /**
     * default: 'camelCaseOnly'
     */
    localsConvention?: 'camelCase' | 'camelCaseOnly' | 'dashes' | 'dashesOnly'
  }
  ```

  Настройка поведения CSS modules. Эти параметры передаются в [postcss-modules](https://github.com/css-modules/postcss-modules).

### css.postcss

- **Type:** `string | (postcss.ProcessOptions & { plugins?: postcss.Plugin[] })`

  Инлайн PostCSS конфиг (поле ожидает тот же формат, что и `postcss.config.js`), кастомный путь для поиска PostCSS конфиг файла (по умолчанию корень проекта). Поиск выполняется с помощью [postcss-load-config](https://github.com/postcss/postcss-load-config).

  Заметьте, если предоставлен инлайновый кофиг, Vite не будет искать другие PostCSS config файлы.

### css.preprocessorOptions

- **Type:** `Record<string, object>`

  Укажите опции для передачи в CSS pre-processors. Пример:

  ```js
  export default defineConfig({
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `$injectedColor: orange;`
        }
      }
    }
  })
  ```

### json.namedExports

- **Type:** `boolean`
- **Default:** `true`

  Поддерживать ли именованный импорт из файлов `.json`.

### json.stringify

- **Type:** `boolean`
- **Default:** `false`

  Если установленно значение `true`, импортируемый JSON будет трансформирован в `export default JSON.parse("...")`, который значительно производительнее, чем Object literals, особенно когда JSON файл очень большой.

  Поставив true, вы отключите именованный импорт (named import).

### esbuild

- **Type:** `ESBuildOptions | false`

  `ESBuildOptions` расширяет [ESbuild's собственные transform options](https://esbuild.github.io/api/#transform-api). Наиболее частый пример использования - это кастомизация JSX:

  ```js
  export default defineConfig({
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment'
    }
  })
  ```

  По умолчанию, ESBuild применяется к `ts`, `jsx` и `tsx` файлам. Вы можете кастомизировать это поведение с помощью `esbuild.include` и `esbuild.exclude`, оба эти параметра ожидают параметры следующих типов: `string | RegExp | (string | RegExp)[]`.

  В дополнение, вы также можете использовать `esbuild.jsxInject` чтобы автоматически инжектить JSX helper imports для каждой трансформации файлов с помощью ESBuild:

  ```js
  export default defineConfig({
    esbuild: {
      jsxInject: `import React from 'react'`
    }
  })
  ```

  Поставьте в значение `false` чтобы отключить ESbuild трансформации.

### assetsInclude

- **Type:** `string | RegExp | (string | RegExp)[]`
- **Related:** [Static Asset Handling](/guide/assets)

  Укажите дополнительные типы файлов, которые будут считаться статичными ресурсами (static assets), и тогда:

  - Эти файлы будут исключены из plugin transform pipeline когда на них ссылаются из HTML или напрямую запрашивают с помощью `fetch` или XHR.

  - Импортирование этих файлов из JS вернёт их резолвнутую URL строку (это поведение может быть перезаписано, если у вас есть `enforce: 'pre'` плагин, чтобы обрабатывать типы ресурсов (asset type) по разному).

  Встроенные типы ресурсов (built-in asset type) перечислены [здесь](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts).

### logLevel

- **Type:** `'info' | 'warn' | 'error' | 'silent'`

  Отрегулируйте подробность вывода информации в консоль. Дефолтное значение&#160;-&#160;`'info'`.

### clearScreen

- **Type:** `boolean`
- **Default:** `true`

  Установите значение `false` чтобы Vite не очищал экран терминала, во время вывода определённых сообщений. Можно передать этот параметр через командную строку: `--clearScreen false`.

### envDir

- **Type:** `string`
- **Default:** `root`

  Директория из которой, загружаются файлы `.env`. Может быть абсолютным путём, или относительным путём к корню проекта.

  Смотрите [это](/guide/env-and-mode#env-files) для большей информации о файлах окружений (environment files).

### envPrefix

- **Type:** `string | string[]`
- **Default:** `VITE_`

  Env переменные начинающиеся с `envPrefix` будут переданы (expose) вашему клиентскому исходному коду через import.meta.env.

:::warning ЗАМЕТКИ БЕЗОПАСНОСТИ

- `envPrefix` не следует устанавливать как `''`, что приведёт к выводу всех ваших env переменных клиенту и может стать причиной утечки важной информации. Vite выведет ошибку, когда обнаружит `''`.
  :::

## Server Options

### server.host

- **Type:** `string`
- **Default:** `'127.0.0.1'`

  Укажите какие IP адреса должен слушать сервер.
  Установите этот параметр в значение `0.0.0.0` чтобы слушать все адреса, включая LAN и public адреса.

  Этот параметр может быть установлен через CLI с помощью`--host 0.0.0.0` или `--host`.

### server.port

- **Type:** `number`

  Укажите порт сервера. Обратите внимание, если порт уже используется, Vite автоматически попытается использовать следующий доступный порт, поэтому в конечном итоге это может быть не тот порт, который слушает сервер.

### server.strictPort

- **Type:** `boolean`

  Задайте значение `true` чтобы завершать работу сервера, если нужный порт уже используется, и Vite не будет использовать следующий доступный порт.

### server.https

- **Type:** `boolean | https.ServerOptions`

  Активирует TLS + HTTP/2. Обратите внимание, этот переход на TLS осуществляется только тогда, когда также используется [`server.proxy` option](#server-proxy).

  Значение также может быть представлено как [options object](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) переданный в `https.createServer()`.

### server.open

- **Type:** `boolean | string`

  Автоматически открывает ваше приложение во вкладке браузера при запуске сервера. Если значение - строка, то оно будет использовано как URL's pathname. Если вы хотите, чтобы приложение открывалось в указаном вами браузере, вы можете установить env переменную `process.env.BROWSER` (например, `firefox`). Смотрите [the `open` package](https://github.com/sindresorhus/open#app) для большей информации.

  **Пример:**

  ```js
  export default defineConfig({
    server: {
      open: '/docs/index.html'
    }
  })
  ```

### server.proxy

- **Type:** `Record<string, string | ProxyOptions>`

  Настройте кастомные прокси правила для dev сервера. Данная опция ожидает объект с парами `{ key: options }`. Если ключ (key) начинается с `^`, то он будет интерпретирован как `RegExp` (регулярное выражение). Опция `configure` может использоваться для доступа к экземпляру proxy.

  Используется [`http-proxy`](https://github.com/http-party/node-http-proxy). Полный список опций доступен [тут](https://github.com/http-party/node-http-proxy#options).

  **Пример:**

  ```js
  export default defineConfig({
    server: {
      proxy: {
        // string shorthand
        '/foo': 'http://localhost:4567',
        // с options
        '/api': {
          target: 'http://jsonplaceholder.typicode.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        // с регуляркой (RegEx)
        '^/fallback/.*': {
          target: 'http://jsonplaceholder.typicode.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/fallback/, '')
        },
        // использование proxy instance
        '/api': {
          target: 'http://jsonplaceholder.typicode.com',
          changeOrigin: true,
          configure: (proxy, options) => {
            // proxy будет экземпляром 'http-proxy'
          }
        }
      }
    }
  })
  ```

### server.cors

- **Type:** `boolean | CorsOptions`

  Настройте CORS для dev сервера. Эта опция активна по умолчанию и позволяет работать любому origin. Передайте [options object](https://github.com/expressjs/cors) чтобы точно настроить повдеение CORS или укажите `false` чтобы отключить его.

### server.force

- **Type:** `boolean`
- **Связанный раздел:** [Dependency Pre-Bundling](/guide/dep-pre-bundling)

  Установите в значение `true` чтобы форсировать dependency pre-bundling (обязательно собрать зависимости).

### server.hmr

- **Type:** `boolean | { protocol?: string, host?: string, port?: number, path?: string, timeout?: number, overlay?: boolean, clientPort?: number, server?: Server }`

  Отключите или настройте HMR соединение (в случае когда HMR websocket должен использовать отличные от http server'а адреса).

  Установите `server.hmr.overlay` в значение `false` чтобы отключить server error overlay.

  `clientPort` - это продвинутая опция, которая перезаписывает порт только на стороне клиента, позволяя вам сёрвить websocket на другом порту, отличным от того, к которому обращается клиентский код. Полезно если вы используете SSL proxy перед своим dev сервером.

  Когда используются `server.middlewareMode` и `server.https`, установка `server.hmr.server` для вашего HTTPS сервера будет обрабатывать HMR secure connection запросы через ваш сервер. Это может быть полезно когда используются самоподписанные (self-signed) сертификаты.

### server.watch

- **Type:** `object`

  File system watcher опции, которые передаются в [chokidar](https://github.com/paulmillr/chokidar#api).

  Когда Vite запускается в Windows Subsystem для Linux (WSL) 2, папка проекта находится в файловой системе Windows, вам нужно будет установить этот параметр `{ usePolling: true }`. Это из-за [WSL2 ограничений](https://github.com/microsoft/WSL/issues/4739) с файловой системой Windows.

### server.middlewareMode

- **Type:** `'ssr' | 'html'`

  Создайте Vite сервер в middleware mode (режиме). (без HTTP сервера)

  - `'ssr'` отключит собственную логику HTML сёрвинга Vite'а и вы должны будете сёрвить `index.html` самостоятельно.
  - `'html'` включит собственную логику HTML сёрвинга Vite.

- **Свзяанный раздел:** [SSR - Настройка Dev сервера](/guide/ssr#setting-up-the-dev-server)

- **Пример:**

```js
const express = require('express')
const { createServer: createViteServer } = require('vite')

async function createServer() {
  const app = express()

  // Создаём Vite сервер в middleware mode (режиме).
  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' }
  })
  // Используем vite's connect instance как middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // Если `middlewareMode` - это `'ssr'`, то сёрвим `index.html` тут.
    // Если `middlewareMode` - это `'html'`, то не нужно сёрвить `index.html`
    // потому что Vite сделает это за нас.
  })
}

createServer()
```

### server.fs.strict

- **Экспереминтальная фича**
- **Type:** `boolean`
- **Default:** `false` (будет заменено на `true` в будущих версиях)

  Ограничьте сёрвинг файлов вне рабочей директории.

### server.fs.allow

- **Экспереминтальная фича**
- **Type:** `string[]`

  Ограничьте файлы, которые будут сёрвиться через `/@fs/`. Когда `server.fs.strict` поставленно в значение`true`, доступ к файлам вне этого списка директорий вернёт 403 ошибку.

  Vite будет искать корень для потенциального workspace и использовать его по умолчанию. Валидный workspace соответствует следующим условиям, в противном случае будет выполнено переключение на корень проекта [project root](/guide/#index-html-and-project-root).

  - содержит `workspaces` поле в `package.json`
  - содержит один из следующих файлов
    - `pnpm-workspace.yaml`

  Принимает путь, чтобы указать кастомный workspace корень. Может быть абсолютным путём или относительным от корня проекта [project root](/guide/#index-html-and-project-root). Например:

  ```js
  export default defineConfig({
    server: {
      fs: {
        // Позволяет сёрвить файлы из директории выше над корнем проекта
        allow: ['..']
      }
    }
  })
  ```

## Build Options

### build.target

- **Type:** `string | string[]`
- **Default:** `'modules'`
- **Связанный раздел:** [Browser Compatibility](/guide/build#browser-compatibility)

  Target браузерной поддержки для финального бандла. Дефолтное значение - специально Vite значение, `'modules'`, которое таргетируется на [браузеры с нативной поддержкой ES модулей](https://caniuse.com/es6-module).

  Другое специальное значение - `'esnext'` - что подразумевает поддержку нативных динамических импортов и будет транспилироваться на столько меньше, на сколкьо это возможно:

  - Если [`build.minify`](#build-minify) параметр - `'terser'` (как по умолчанию), `'esnext'` будет вынужден перейти на  `'es2019'`.
  - В других случаях, транспиляция вообще не будет выполняться.

  Трансформация выполняется с помощью esbuild и значение парметра должно быть валидной [esbuild target опцией](https://esbuild.github.io/api/#target). Кастомные могут быть указаны, как ES версии (например, `es2015`), браузеры определённой версии (например, `chrome58`), или массив множества разных target строк.

  Обратите внимание, сборка завершится ошибкой, если код содержит фичи, которые нельзя безопасно транспилировать с помощью esbuild. Смотрите [esbuild документацию](https://esbuild.github.io/content-types/#javascript) для большей иформации.

### build.polyfillModulePreload

- **Type:** `boolean`
- **Default:** `true`

  Следуют ли автоматически инжектить [module preload polyfill](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill).

  Если установлено в значение `true`, polyfill автоматически встраивается в proxy модуль каждого `index.html` entry. Если сборка настроена на использование non-html кастомного entry через `build.rollupOptions.input`, то необходимо вручную импортировать polyfill в ваш кастомный entry:

  ```js
  import 'vite/modulepreload-polyfill'
  ```

  Обратите внимание: polyfill **НЕ** приминяется к [Library Mode](/guide/build#library-mode). Если вам нужна поддержка браузеров без нативного динамического импорта (dynamic import), вам вероятно следует избегать использования этого в вашей библиотеке.

### build.outDir

- **Type:** `string`
- **Default:** `dist`

  Укажите output директорию (относительно [project root](/guide/#index-html-and-project-root)).

### build.assetsDir

- **Type:** `string`
- **Default:** `assets`

  Укажите директорию для вложения сгенерированных ресурсов (assets) (относительно `build.outDir`).

### build.assetsInlineLimit

- **Type:** `number`
- **Default:** `4096` (4kb)

  Импортированные или ресрусы, на которые есть ссылки, размер которых меньше, чем указанный в этом параметре порог, будут вставлены инлайном как base64 URL чтобы избежать лишних http запросов. Поставьте в значение `0` чтобы отключить инлайновую вставку ресурсов совсем.

  ::: tip Заметка
  Если вы укажите `build.lib`, то `build.assetsInlineLimit` будет игнорироваться и ресурсы (assets) всегда будут вставлены инлайном, независимо от размера файлов.
  :::

### build.cssCodeSplit

- **Type:** `boolean`
- **Default:** `true`

  Включить/отключить CSS code splitting (разделение CSS кода на файлы). Когда включено, CSS импортируемый в async chunks будет вставлен инлайном в этот же async chunk и вставляется когда chunk загружен.

  Если отключено, все CSS во всём проекте будут извлечены в один CSS файл.

### build.sourcemap

- **Type:** `boolean | 'inline' | 'hidden'`
- **Default:** `false`

  Генерирует production source maps. Если значение `true`, то будет создан отдельный sourcemap. Если `'inline'`, то  sourcemap будет добавлен в финальный output файл как data URI. `'hidden'` работает как `true` за исключением того, что  соответствующие sourcemap комментарии в собранных файлах удалены.

### build.rollupOptions

- **Type:** [`RollupOptions`](https://rollupjs.org/guide/en/#big-list-of-options)

  Напрямую кастомизируйте основные настройки Rollup сборки. Это то же самое, что и опции, которые могут быть экспортированы из Rollup конфиг файла и они будут смёржены с Vite's внутренними Rollup опциями. Смотрите [Rollup options документацию](https://rollupjs.org/guide/en/#big-list-of-options) для большей информации.

### build.commonjsOptions

- **Type:** [`RollupCommonJSOptions`](https://github.com/rollup/plugins/tree/master/packages/commonjs#options)

  Опции, которые передаются в [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs).

### build.dynamicImportVarsOptions

- **Type:** [`RollupDynamicImportVarsOptions`](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#options)

  Опции, которые передаются в [@rollup/plugin-dynamic-import-vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars).

### build.lib

- **Type:** `{ entry: string, name?: string, formats?: ('es' | 'cjs' | 'umd' | 'iife')[], fileName?: string | ((format: ModuleFormat) => string) }`
- **Связанный раздел:** [Library Mode](/guide/build#library-mode)

  Сборка как library (библиотека). `entry` - обязателен, поскольку library не может использовать HTML как entry. `name` - это открытая глобальная переменная и она обязательна, когда `formats` включает `'umd'` или `'iife'`. Дефолтные `formats` - это `['es', 'umd']`. `fileName` - это название package file output, по умолчанию `fileName` - это name option из package.json, этот параметр также может быть определён как функция, принимающая `format` как аргумент.

### build.manifest

- **Type:** `boolean`
- **Default:** `false`
- **Связанный раздел:** [Backend Integration](/guide/backend-integration)

  Когда установлено в значение `true`, сборка будет генерировать `manifest.json` файл, который содержит mapping нехешированных имён ресурсов (assets) к их хешированным версиям, который в дальнейшем может быть использован серверным фреймворком чтобы срендерить корректные ссылки на ресурсы (assets).

### build.minify

- **Type:** `boolean | 'terser' | 'esbuild'`
- **Default:** `'terser'`

  Установите в значение `false` чтобы отключить минификацию, или укажите minifier, который хотите использовать. Дефолтный - [Terser](https://github.com/terser/terser), он медленее, но в большинстве случаев предоставляет меньшие бандлы. Esbuild минификация значительно быстрее, но в конечном итоге создаёт значительно больше бандлов.

### build.terserOptions

- **Type:** `TerserOptions`

  Дополнительные [minify опции](https://terser.org/docs/api-reference#minify-options), которые передаются в Terser.

### build.write

- **Type:** `boolean`
- **Default:** `true`

  Поставьте значение `false` чтобы запретить запись бандла на диск. Это часто используется в [программные `build()` вызовы](/guide/api-javascript#build), где дальнейший пост процессинг бандла необходим до записи на диск.

### build.emptyOutDir

- **Type:** `boolean`
- **Default:** `true` if `outDir` is inside `root`

  По умолчанию, Vite будет очищать `outDir` при сборке build, если он внутри корня проекта. Выведет ошибку если `outDir` находится вне рутовой директории, чтобы избеать случайного удаления важных файлов. Вы можете явно указать этот параметр чтобы отключить warning'и. Это также можно сдлеать с помощью параметра командной строки `--emptyOutDir`.

### build.brotliSize

- **Type:** `boolean`
- **Default:** `true`

  Активирует/деактивирует brotli-compressed size reporting (отчёт о размере файлов). Сжатие больших output файлов может быть медленным, поэтому отключение этой опции может увеличить производительность сборки для больших проектов.

### build.chunkSizeWarningLimit

- **Type:** `number`
- **Default:** `500`

  Ограничение для chunk size warnings (варнинги о больших размерах файлов) (в kbs).

### build.watch

- **Type:** [`WatcherOptions`](https://rollupjs.org/guide/en/#watch-options)`| null`
- **Default:** `null`

  Установите в значение `{}` чтобы активировать rollup watcher. Это часто используется в случаях, когда используются  build-only плагины или для интеграционных процессов.

## Dep Optimization Options

- **Связанный раздел:** [Dependency Pre-Bundling](/guide/dep-pre-bundling)

### optimizeDeps.entries

- **Type:** `string | string[]`

  По умолчанию, Vite будет искать ваш index.html файл, чтобы определить зависимости, которые нужно предсобрать (pre-bundled). Если build.rollupOptions.input указан, тогда Vite будет искать эти entry points.

  Если ни одно из этих не подходит под ваши нужды, вы можете указать кастомные entries используя эту опцию - значение должно быть в формате [fast-glob pattern](https://github.com/mrmlnc/fast-glob#basic-syntax) или массив паттернов, которые относительны к Vite корню проекта. Это перезапишет дефолтные entries.

### optimizeDeps.exclude

- **Type:** `string[]`

  Зависимости, которые нужно исключить из pre-bundling.

  :::warning CommonJS
  CommonJS зависимости не должны быть исключены из оптимизации. Если ESM зависимость исключена из оптимизации, но у неё есть вложенная CommonJS зависимость, то CommonJS зависимость должна быть добавлена в `optimizeDeps.include`. Пример:

  ```js
  export default defineConfig({
    optimizeDeps: {
      include: ['esm-dep > cjs-dep']
    }
  })
  ```

  :::

### optimizeDeps.include

- **Type:** `string[]`

  По умолчанию, залинкованные пакеты в `node_modules` не pre-bundled (предсобираются). Используйте этот параметр, чтобы в обязательно порядке предсобрать (pre-bundled) залинкованные пакеты.

### optimizeDeps.keepNames

- **Type:** `boolean`
- **Default:** `false`

  Иногда бандлеру нужно переименовать symbols, чтобы избежать коллизий.
  Поставьте этот параметр в значение `true` чтобы сохранить свойство `name` в функциях и классах.
  Смотрите [`keepNames`](https://esbuild.github.io/api/#keep-names).

## SSR Options

:::warning Экспериментальная опция
SSR опции могут быть изменены в следующих минорных релизах (minor releases).
:::

- **Связанный раздел:** [SSR Externals](/guide/ssr#ssr-externals)

### ssr.external

- **Type:** `string[]`

  Принудительно экстернализируйте зависимости для SSR.

### ssr.noExternal

- **Type:** `string | RegExp | (string | RegExp)[] | true`

  Предотвратить экстернализацию перечисленных зависимостей для SSR. Если `true`, то никакие зависимости не экстернализируются.

### ssr.target

- **Type:** `'node' | 'webworker'`
- **Default:** `node`

  Target сборки для SSR сервера.
