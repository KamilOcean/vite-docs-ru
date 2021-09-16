# Использование плагинов

Функционал Vite может быть расширен с помощью плагинов, которые основываются на хорошо спроектированном интерфейсе плагинов Rollup с несколькими дополнительными Vite-специфичными опциями. Это значит, что Vite пользователи могут положиться на развитую экосистему Rollup плагинов, а также при необходимости есть возможность расширять функциональность dev сервера и SSR функциональности.

## Добавление плагина

Чтобы использовать плагин, его нужно добавить в `devDependencies` проекта и включить в массив `plugins` в файле `vite.config.js`. Например, чтобы предоставить поддержку старых браузеров, можно использовать официальный плагин [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy):

```
$ npm i -D @vitejs/plugin-legacy
```

```js
// vite.config.js
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
})
```

`plugins` также принимает presets (заготовки), включающие несколько плагинов как один элемент. Это полезно для сложного функционала (такого как интеграция фрэймворка), который реализуется использованием нескольких различных плагинов. Массив будет выровнен (flattened).

Плагины с Falsy значением будут игнорироваться, что позволяет легко активировать или деактивировать плагины.

## Поиск плагинов

:::tip Заметка
Vite стремится предоставить готовую поддержку распространенных шаблонов веб-разработки. Перед поиском Vite или совместимого подключаемого модуля Rollup ознакомьтесь с [Руководство - функционал](../guide/features.md). Во многих случаях, когда в проекте Rollup потребуется плагин, его уже можно найти в Vite.
:::

Ознакомьтесь с разделом [Плагины](../plugins/) для информации об официальных плагинах. Плагины сообщества перечислены здесь: [awesome-vite](https://github.com/vitejs/awesome-vite#plugins). Чтобы найти совместимые Rollup плагины, смотрите [Vite Rollup Plugins](https://vite-rollup-plugins.patak.dev) чтобы увидеть список совместимых официальных Rollup плагинов с инструкциями по использованию или раздел [Rollup Plugin Compatibility](../guide/api-plugin#rollup-plugin-compatibility), если его там нет.

Вы также можете найти плагины, которые следуют [рекомендуемым соглашениям (recommended conventions)](./api-plugin.md#conventions) используя [npm search for vite-plugin](https://www.npmjs.com/search?q=vite-plugin&ranking=popularity) для Vite плагинов или [npm search for rollup-plugin](https://www.npmjs.com/search?q=rollup-plugin&ranking=popularity) для Rollup плагинов.

## Обеспечение порядка плагинов

Для совместимости с некоторыми Rollup плагинами может потребоваться принудительно установить их порядок или применить их только во время сборки. Это должна быть деталь реализации плагинов Vite. Вы можете принудительно установить позицию плагина с помощью модификатора `enforce`:

- `pre`: вызывает плагин до Vite core плагинов
- default: вызывает плагин после Vite core плагинов
- `post`: вызывает плагин после Vite build плагинов

```js
// vite.config.js
import image from '@rollup/plugin-image'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...image(),
      enforce: 'pre'
    }
  ]
})
```

Ознакомьтесь с [Руководство по API плагинов](./api-plugin.md#plugin-ordering) для более детальной информации, и обратите внимание на метку `enforce` и пользовательские инструкции для популярных плагинов в [Vite Rollup Plugins](https://vite-rollup-plugins.patak.dev) списке совместимости.

## Условное приложение

По умолчанию плагины вызываются как для сёрвинга файлов (serve), так и для сборки (build). В случаях, когда плагин необходимо условно применять только во время serve или build, используйте свойство `apply`, чтобы вызывать их только во время `build` или `serve`:

```js
// vite.config.js
import typescript2 from 'rollup-plugin-typescript2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...typescript2(),
      apply: 'build'
    }
  ]
})
```

## Создание плагинов

Ознакомьтесь с [Руководством по API плагинов](./api-plugin.md) для документации о создании плагинов.
