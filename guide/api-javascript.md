# JavaScript API

API-интерфейсы JavaScript Vite полностью типизированы, и рекомендуется использовать TypeScript или включить проверку типа JS в VSCode, чтобы использовать intellisense и проверку.

## `createServer`

**Type Signature:**

```ts
async function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>
```

**Пример использования:**

```js
const { createServer } = require('vite')

;(async () => {
  const server = await createServer({
    // любые валидные user config options, плюс `mode` и `configFile`
    configFile: false,
    root: __dirname,
    server: {
      port: 1337
    }
  })
  await server.listen()
})()
```

## `InlineConfig`

`InlineConfig` интерфейс расширяет `UserConfig` дополнительными свойствами:

- `configFile`: укажите какой config файл использовать. Если не указано, Vite будет пытаться автоматически найти этот файл в вашем корневой директории. Поставьте значение `false`, чтобы отменить автопоиск конфиг файла.
- `envFile`: Поставьте `false`, чтобы отключить `.env` файлы.

## `ViteDevServer`

```ts
interface ViteDevServer {
  /**
   * The resolved Vite config object.
   */
  config: ResolvedConfig
  /**
   * A connect app instance
   * - Может быть использовано, чтобы добавить кастомные middlewares в ваш dev server.
   * - Также может использоваться для обработки функции кастомного http server'а
   *   или как middleware в любом connect-style Node.js фреймворке.
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * Нативный экземпляр Node http server'а.
   * Будет null в middleware mode.
   */
  httpServer: http.Server | null
  /**
   * Chokidar watcher instance.
   * https://github.com/paulmillr/chokidar#api
   */
  watcher: FSWatcher
  /**
   * Web socket server с методом `send(payload)`.
   */
  ws: WebSocketServer
  /**
   * Rollup plugin container, который может запускать хуки плагинов на полученном файле.
   */
  pluginContainer: PluginContainer
  /**
   * Module graph, который отслеживает взаимоотношение импортов, url для маппинга файлов
   * и hmr состояние.
   */
  moduleGraph: ModuleGraph
  /**
   * Programmatically resolve, загрузить и трансформировать URL и получить результат
   * без прохождения через http request pipeline.
   */
  transformRequest(
    url: string,
    options?: TransformOptions
  ): Promise<TransformResult | null>
  /**
   * Применить Vite built-in HTML трансформации и любые plugin HTML трансформации.
   */
  transformIndexHtml(url: string, html: string): Promise<string>
  /**
   * Используйте для трансформации файла с esbuild.
   * Может быть полезно для нескольких плагинов.
   */
  transformWithEsbuild(
    code: string,
    filename: string,
    options?: EsbuildTransformOptions,
    inMap?: object
  ): Promise<ESBuildTransformResult>
  /**
   * Загрузить полученный URL как instantiated module для SSR.
   */
  ssrLoadModule(
    url: string,
    options?: { isolated?: boolean }
  ): Promise<Record<string, any>>
  /**
   * Fix ssr error stacktrace.
   */
  ssrFixStacktrace(e: Error): void
  /**
   * Запустить the server.
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  /**
   * Остановить the server.
   */
  close(): Promise<void>
}
```

## `build`

**Type Signature:**

```ts
async function build(
  inlineConfig?: InlineConfig
): Promise<RollupOutput | RollupOutput[]>
```

**Пример использования:**

```js
const path = require('path')
const { build } = require('vite')

;(async () => {
  await build({
    root: path.resolve(__dirname, './project'),
    build: {
      base: '/foo/',
      rollupOptions: {
        // ...
      }
    }
  })
})()
```

## `resolveConfig`

**Type Signature:**

```ts
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode?: string
): Promise<ResolvedConfig>
```
