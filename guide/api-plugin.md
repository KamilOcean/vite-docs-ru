# Plugin API

Vite плагины расширяют хорошо спроектированный интерфейс плагинов Rollup с некоторыми дополнительными Vite-specific опциями. Поэтому, вы можете один раз написать Vite плагин и он будет работать и в dev и в build.

**Рекомендуется сначала прочитать [Rollup's plugin documentation](https://rollupjs.org/guide/en/#plugin-development) прежде чем продолжать чтение этой секции.**

## Соглашения

Если плагин не использует Vite specific hooks и может быть реализован как [Compatible Rollup Plugin](#rollup-plugin-compatibility), то мы рекомендуем использовать [Rollup Plugin naming conventions](https://rollupjs.org/guide/en/#conventions)

- Rollup плагины должны иметь понятное имя с префиксом `rollup-plugin-`.
- Включать `rollup-plugin` и `vite-plugin` ключевые слова в package.json.

Это также позволяет использовать плагин в чистом Rollup или WMR based проектах

Для плагинов только для Vite

- Vite плагины должны иметь понятное имя с префиксом `vite-plugin-`.
- Включать `vite-plugin` ключевое слово в package.json.
- Иметь раздел документации плагина, детально описывающий почему этот плагин только для Vite (например, плагин использует Vite specific plugin hooks).

Если ваш плагин будет работать только с конкретным фреймворком, то название плагина должно включать в себя часть с префиксом этого фреймворка

- `vite-plugin-vue-` префикс для Vue плагинов
- `vite-plugin-react-` префикс для React плагинов
- `vite-plugin-svelte-` префикс для Svelte плагинов

## Plugins config

Пользователи будут добавлять плагины в`devDependencies` проекта и настраивать их используя `plugins` array option.

```js
// vite.config.js
import vitePlugin from 'vite-plugin-feature'
import rollupPlugin from 'rollup-plugin-feature'

export default defineConfig({
  plugins: [vitePlugin(), rollupPlugin()]
})
```

Falsy плагины будут игнорированы, что может быть использовано для лёгкой активации и деактивации плагинов.

`plugins` также принимает preset'ы включающие несколько плагинов как один элемент. Это полезно для сложных фич (таких, как интеграция фреймворков), которая реализуется используя несколько плагинов. Массив будет внутренне "flattened" выровнен (элементы на одном уровне, без вложенности).

```js
// framework-plugin
import frameworkRefresh from 'vite-plugin-framework-refresh'
import frameworkDevtools from 'vite-plugin-framework-devtools'

export default function framework(config) {
  return [frameworkRefresh(config), frameworkDevTools(config)]
}
```

```js
// vite.config.js
import { defineConfig } from 'vite'
import framework from 'vite-plugin-framework'

export default defineConfig({
  plugins: [framework()]
})
```

## Простые примеры

:::tip Подсказка
Общепринятым является создание Vite/Rollup плагина как factory function "функция фабрика", которая возвращает актуальный объект плагина. Функция может принимать параметры, которые позволяют пользователям кастомизировать поведение плагина.
:::

### Importing a Virtual File

```js
export default function myPlugin() {
  const virtualFileId = '@my-virtual-file'

  return {
    name: 'my-plugin', // обязательно, будет показано при warnings и errors
    resolveId(id) {
      if (id === virtualFileId) {
        return virtualFileId
      }
    },
    load(id) {
      if (id === virtualFileId) {
        return `export const msg = "from virtual file"`
      }
    }
  }
}
```

Это позволяет нам импортировать файл в JavaScript:

```js
import { msg } from '@my-virtual-file'

console.log(msg)
```

### Трансформирование Custom File Types

```js
const fileRegex = /\.(my-file-ext)$/

export default function myPlugin() {
  return {
    name: 'transform-file',

    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: compileFileToJS(src),
          map: null // provide source map if available
        }
      }
    }
  }
}
```

## Universal Hooks

В процессе разработки, Vite dtv сервер создаёт плагин контейнер, который вызывает [Rollup Build Hooks](https://rollupjs.org/guide/en/#build-hooks) Rollup делает это тем же способом.

Следующие hooks (хуки) вызываются один раз при запуске сервера:

- [`options`](https://rollupjs.org/guide/en/#options)
- [`buildStart`](https://rollupjs.org/guide/en/#buildstart)

Следующие hooks (хуки) вызываются при каждом входящем запросе модуля:

- [`resolveId`](https://rollupjs.org/guide/en/#resolveid)
- [`load`](https://rollupjs.org/guide/en/#load)
- [`transform`](https://rollupjs.org/guide/en/#transform)

Следующие hooks (хуки) вызываются когда сервер потушен:

- [`buildEnd`](https://rollupjs.org/guide/en/#buildend)
- [`closeBundle`](https://rollupjs.org/guide/en/#closebundle)

Обратите внимание, что [`moduleParsed`](https://rollupjs.org/guide/en/#moduleparsed) hook **НЕ** вызывается во время dev, потому что Vite избегает полного парсинга AST для улучшения производительности.

[Output Generation Hooks](https://rollupjs.org/guide/en/#output-generation-hooks) (кроме `closeBundle`)  **НЕ** вызываются во время dev. Вы можете думать, что Vite's dev сервер вызывает только `rollup.rollup()` без вызова `bundle.generate()`.

## Vite Specific Hooks

Vite плагины также могу предоставлять хуки, которые служат Vite-specific целям. Rollup игнорирует эти хуки.

### `config`

- **Type:** `(config: UserConfig, env: { mode: string, command: string }) => UserConfig | null | void`
- **Kind:** `async`, `sequential`

  Изменяет конфигурацию Vite, прежде чем она будет резолвнута. Хук получает необработанный config (CLI option смёрдженные с конфиг файлом) и текущую конфигурацию env, которая exposes используемые `mode` и `command`. Можете вернуть частичный объект конфига, который будет глубоко смёрджен (deeply merged) с существующей конфигурацией или напрямую изменить congif (если дефолтный merging не может достичь желаемого результата).

  **Пример:**

  ```js
  // вернуть частичный конфиг (рекомендуется)
  const partialConfigPlugin = () => ({
    name: 'return-partial',
    config: () => ({
      alias: {
        foo: 'bar'
      }
    })
  })

  // напрямую изменить конфиг (используйте только когда merging не работает)
  const mutateConfigPlugin = () => ({
    name: 'mutate-config',
    config(config, { command }) {
      if (command === 'build') {
        config.root = __dirname
      }
    }
  })
  ```

  ::: warning Заметка
  Плагины пользователей резолвятся до запуска этого хука, поэтому встраивание (injecting) других плагинов внутри `config` хука не приведёт ни к каким результатам.
  :::

### `configResolved`

- **Type:** `(config: ResolvedConfig) => void | Promise<void>`
- **Kind:** `async`, `parallel`

  Вызывается после того, как Vite config резолвнется. Используйте этот хук, чтобы прочитать и сохранить финальный резолвнутый конфиг. Это также полезно, когда плагину нужно сделать что-нибудь другое в зависимости от выполняемой команды.

  **Пример:**

  ```js
  const examplePlugin = () => {
    let config

    return {
      name: 'read-config',

      configResolved(resolvedConfig) {
        // сохранить резолвнутый (resolved) config
        config = resolvedConfig
      },

      // потом можно использовать сохранённый store в других хуках
      transform(code, id) {
        if (config.command === 'serve') {
          // serve: plugin invoked by dev server
        } else {
          // build: plugin invoked by Rollup
        }
      }
    }
  }
  ```

### `configureServer`

- **Type:** `(server: ViteDevServer) => (() => void) | void | Promise<(() => void) | void>`
- **Kind:** `async`, `sequential`
- **Читайте также:** [ViteDevServer](./api-javascript#vitedevserver)

  Хук для настройки (конфигурирования) dev сервера. Самый популярный случай использования - это добавление кастомноых middlewares во внутренний [connect](https://github.com/senchalabs/connect) app:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // custom handle request...
      })
    }
  })
  ```

  **Injecting Post Middleware**

  `configureServer` хук вызывается до того, как внутренние middlewares установлены, поэтому кастомные middlewares будут запущены до internal middlewares по умолчанию. Если вы хотите заинжектить middleware **после** internal middlewares, вы можете вернуть функцию из `configureServer`, которая будет вызвана после того, как internal middlewares будут установлены:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      // возвращаем post hook, который вызовется после того, как
      // internal middlewares будут установлены
      return () => {
        server.middlewares.use((req, res, next) => {
          // custom handle request...
        })
      }
    }
  })
  ```

  **Storing Server Access**

  В некоторых случаях, другим хукам плагина могут понадобиться доступы до экземпляра dev сервера (например, доступ до web socket server, the file system watcher, или the module graph). Этот хук может быть использован для сохранения экземпляра сервера, чтобы потом обращаться к этому экземпляру из других хуков:

  ```js
  const myPlugin = () => {
    let server
    return {
      name: 'configure-server',
      configureServer(_server) {
        server = _server
      },
      transform(code, id) {
        if (server) {
          // use server...
        }
      }
    }
  }
  ```

  Заметьте, `configureServer` не вызывается когда запущен production build, поэтому другим вашим хукам необходимо подготовиться к этому, к отсутствию этого хука.

### `transformIndexHtml`

- **Type:** `IndexHtmlTransformHook | { enforce?: 'pre' | 'post' transform: IndexHtmlTransformHook }`
- **Kind:** `async`, `sequential`

  Выделенный хук для трансформирования `index.html`. Этот хук получает текущую HTML строку и transform context. Context предоставляет [`ViteDevServer`](./api-javascript#vitedevserver) экземпляр во время dev (разработки) и output Rollup bundle для build.

  Этот хук может быть асинхронным и может возвращать одно из следующих значений:

  - Трансформированную HTML строку
  - Array of tag descriptor objects (`{ tag, attrs, children }`) , чтобы встроить их в существующий HTML. Каждый тег также может указать куда ему следует инжектиться (по умолчанию добавляется в `<head>`)
  - Объект содержащий `{ html, tags }`

  **Базовый пример:**

  ```js
  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>Title replaced!</title>`
        )
      }
    }
  }
  ```

  **Full Hook Signature (полная сигнатура хука):**

  ```ts
  type IndexHtmlTransformHook = (
    html: string,
    ctx: {
      path: string
      filename: string
      server?: ViteDevServer
      bundle?: import('rollup').OutputBundle
      chunk?: import('rollup').OutputChunk
    }
  ) =>
    | IndexHtmlTransformResult
    | void
    | Promise<IndexHtmlTransformResult | void>

  type IndexHtmlTransformResult =
    | string
    | HtmlTagDescriptor[]
    | {
        html: string
        tags: HtmlTagDescriptor[]
      }

  interface HtmlTagDescriptor {
    tag: string
    attrs?: Record<string, string | boolean>
    children?: string | HtmlTagDescriptor[]
    /**
     * default: 'head-prepend'
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
  }
  ```

### `handleHotUpdate`

- **Type:** `(ctx: HmrContext) => Array<ModuleNode> | void | Promise<Array<ModuleNode> | void>`

  Выполняет кастомную обработку HMR обновлений. Этот хук получает context object со следующей сигнатурой:

  ```ts
  interface HmrContext {
    file: string
    timestamp: number
    modules: Array<ModuleNode>
    read: () => string | Promise<string>
    server: ViteDevServer
  }
  ```

  - `modules` массив модулей, которые затронуты изменениями в файле. Это массив, потому что одиночный файл может мапиться с несколькими модулями, обрабатываемыми сервером (например, Vue SFCs).

  - `read` это асинхронная функция чтения, которая возвращает content файла. Это предоставляется потому что на некоторых системах, callback от изменений файла может происходить даже быстрее, чем пользователь успеет изменить файл и прямой метод `fs.readFile` вернёт пустой контент. Функция чтения нормализует это поведение.

  Хук можно использовать для:

  - Фильтрации и отсечения ненужного списка затронутых модулей, чтобы HMR работал более точнее.

  - Возвращения пустого массива и выполнения полной пользовательской обработки HMR, отправив пользователю custom events:

    ```js
    handleHotUpdate({ server }) {
      server.ws.send({
        type: 'custom',
        event: 'special-update',
        data: {}
      })
      return []
    }
    ```

    Клиентский код должен зарегистрировать соответствующий обработчик используя [HMR API](./api-hmr) (это может быть встроено с помощью хука `transform` этого же плагина):

    ```js
    if (import.meta.hot) {
      import.meta.hot.on('special-update', (data) => {
        // perform custom update
      })
    }
    ```

## Порядок применения плагинов

Vite плагин может дополнительно указать свойство `enforce` (похоже на webpack loaders) чтобы настроить порядок применения плагинов. Значение поля `enforce` может быть `"pre"` или `"post"`. Резолвнутые плагины будут идти в следующем порядке:

- Alias
- Пользовательские плагины с `enforce: 'pre'`
- Vite core плагины
- Пользовательские плагины без значения enforce
- Vite build плагины
- Пользовательские плагины с `enforce: 'post'`
- Vite post build плагины (minify, manifest, reporting)

## Условное применение

По умолчанию плагины выполняются и для serve и для build. В случае, где плагин нужно применить только на serve или build, используйте свойство `apply`, чтобы запустить плагин только на `'build'` или `'serve'`:

```js
function myPlugin() {
  return {
    name: 'build-only',
    apply: 'build' // or 'serve'
  }
}
```

Также для большего контроля можно использовать какую-нибудь функцию:

```js
apply(config, { command }) {
  // apply only on build but not for SSR
  return command === 'build' && !config.build.ssr
}
```

## Совместимость с Rollup плагинами

Изрядное количество подключаемых Rollup плагинов будут работать прямо как Vite плагины (например `@rollup/plugin-alias` или `@rollup/plugin-json`), но не все плагины работают так, поскольку некоторые хуки плагинов не имеют смысла в (несобранном) unbundled dev сервер контексте.

В общем, если плагин Rollup соответствует следующим критериям, то он должен работать как простой Vite плагин:

- Он не использует [`moduleParsed`](https://rollupjs.org/guide/en/#moduleparsed) хук.
- Он не имеет жёсткой связи с bundle-phase хуками и output-phase хуками.

Если Rollup плагин может быть применим только на build phase, то лучше указать его в `build.rollupOptions.plugins`.

Вы также можете дополнить существующий Rollup плагин Vite-only свойствами:

```js
// vite.config.js
import example from 'rollup-plugin-example'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...example(),
      enforce: 'post',
      apply: 'build'
    }
  ]
})
```

Ознакомьтесь с [Vite Rollup Plugins](https://vite-rollup-plugins.patak.dev) - список официальных совместимых Rollup плагинов с пользовательскими инструкциями.

## Нормализация путей

Vite нормализует пути при резолве id, чтобы использовать POSIX разделители ( / ) при сохранении volume в Windows. С другой стороны, Rollup оставляет нетронутыми пути по умолчанию, поэтому резолвнутые id имеют win32 разделители ( \\ ) в Windows. Однако, Rollup плагины используют [`normalizePath` utility function](https://github.com/rollup/plugins/tree/master/packages/pluginutils#normalizepath) из `@rollup/pluginutils` внутренне, который преобразует разделители в POSIX до выполнения сравнения. Это значит, что когда эти плагины используются в Vite, `include` и `exclude` config pattern и другие аналогичные пути для сравнения резолвнутых id работают правильно.

Итак, для Vite плагинов, при сравнении резолвнутых путей id важно сначала нормализовать пути для использования POSIX разделителей. Эквивалентная утилитарная функция `normalizePath` экспортируется из модуля `vite`.

```js
import { normalizePath } from 'vite'

normalizePath('foo\\bar') // 'foo/bar'
normalizePath('foo/bar') // 'foo/bar'
```
