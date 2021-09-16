# Миграция с v1

## Изменения в Config Options

- Следующие опции были удалены, и они будут реализовываться с помощью [plugins](./api-plugin):

  - `resolvers`
  - `transforms`
  - `indexHtmlTransforms`

- `jsx` и `enableEsbuild` удалены; Используйте вместо этого новую опцию [`esbuild`](/config/#esbuild).

- [CSS related options](/config/#css-modules) сейчас вложены в `css`.

- Все [build-specific options](/config/#build-options) сейчас вложены в `build`.

  - `rollupInputOptions` и `rollupOutputOptions` заменены на [`build.rollupOptions`](/config/#build-rollupoptions).
  - `esbuildTarget` сейчас - [`build.target`](/config/#build-target).
  - `emitManifest` сейчас - [`build.manifest`](/config/#build-manifest).
  - Следующие build опции удалены, потому что они могут быть настроены через плагин хуков (plugin hooks) или другие опции:
    - `entry`
    - `rollupDedupe`
    - `emitAssets`
    - `emitIndex`
    - `shouldPreload`
    - `configureBuild`

- Все [server-specific options](/config/#server-options) сейчас вложены в
  `server`.

  - `hostname` сейчас - [`server.host`](/config/#server-host).
  - `httpsOptions` удалено. [`server.https`](/config/#server-https) может прямо получать объект с опциями.
  - `chokidarWatchOptions` сейчас - [`server.watch`](/config/#server-watch).

- [`assetsInclude`](/config/#assetsinclude) сейчас принимает `string | RegExp | (string | RegExp)[]` вместо функции.

- Все Vue specific опции удалены; Вместо этого, передавайте опции во Vue plugin.

## Изменения в Alias Behavior

[`alias`](/config/#resolve-alias) сейчас передаются в `@rollup/plugin-alias` и больше не нужно start/ending слэшей. Поведение сейчас -  это прямая замена, поэтому у 1.0-style directory alias ключей надо удалить ending слэш:

```diff
- alias: { '/@foo/': path.resolve(__dirname, 'some-special-dir') }
+ alias: { '/@foo': path.resolve(__dirname, 'some-special-dir') }
```

Или же вы можете использовать формат опций `[{ find: RegExp, replacement: string }]` для более точного контроля.

## Поддержка Vue

Vite 2.0 core сейчас независим от фреймворка "framework agnostic". Поддержка Vue реализована благодаря [`@vitejs/plugin-vue`](https://github.com/vitejs/vite/tree/main/packages/plugin-vue). Просто установите этот плагин и добавьте его в Vite config файл:

```js
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()]
})
```

### Custom Blocks Transforms

Кастомный плагин может быть использован для трансформации Vue custom блоков как в примере ниже:

```ts
// vite.config.js
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const vueI18nPlugin = {
  name: 'vue-i18n',
  transform(code, id) {
    if (!/vue&type=i18n/.test(id)) {
      return
    }
    if (/\.ya?ml$/.test(id)) {
      code = JSON.stringify(require('js-yaml').safeLoad(code.trim()))
    }
    return `export default Comp => {
      Comp.i18n = ${code}
    }`
  }
}

export default defineConfig({
  plugins: [vue(), vueI18nPlugin]
})
```

## Поддержка React

Поддеркжка React Fast Refresh доступна через [`@vitejs/plugin-react-refresh`](https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh).

## Изменения в HMR API

`import.meta.hot.acceptDeps()` устарело `deprecated`. [`import.meta.hot.accept()`](./api-hmr#hot-accept-deps-cb) сейчас может принимать одну или множество зависимостей (deps).

## Изменения формата Manifest

Build manifest сейчас использует следующий формат:

```json
{
  "index.js": {
    "file": "assets/index.acaf2b48.js",
    "imports": [...]
  },
  "index.css": {
    "file": "assets/index.7b7dbd85.css"
  }
  "asset.png": {
    "file": "assets/asset.0ab0f9cd.png"
  }
}
```

Для entry JS chunks, также выводится список импортированных чанков, которые могут быть использованы для рендера preload directives.

## Для авторов плагинов

Vite 2 использует совершенно перепроектированный интерфейс плагинов, который расширяет плагины Rollup'а. Пожалуйста, читайте новый [Plugin Development Guide](./api-plugin).

Некоторые общие пункты для миграции с v1 plugin на v2:

- `resolvers` -> используйте [`resolveId`](https://rollupjs.org/guide/en/#resolveid) hook
- `transforms` -> используйте [`transform`](https://rollupjs.org/guide/en/#transform) hook
- `indexHtmlTransforms` -> используйте [`transformIndexHtml`](./api-plugin#transformindexhtml) hook
- Serving virtual files -> используйте [`resolveId`](https://rollupjs.org/guide/en/#resolveid) + [`load`](https://rollupjs.org/guide/en/#load) hooks
- Добавить `alias`, `define` или другие config опции -> используйте [`config`](./api-plugin#config) hook

Так как большинство логики можно реализовать через плагин хуков (plugin hooks) вместо middlewares, то нужда в middlewares значительно уменьшена. Internal server app сейчас старый добрый - [connect](https://github.com/senchalabs/connect) вместо Koa.
