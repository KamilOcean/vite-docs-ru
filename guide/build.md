# Сборка для Production

Когда приходит время деплоить ваше приложение на прод, просто запустите команду `vite build`. По умолчанию в сборке используется `<root>/index.html` как точка входа (entry point) и создаёт application bundle, который подходит для размещения на статическом хостинг сервисе. Ознакомьтесь с руководством [Деплой статического сайта](./static-deploy), чтобы посмотреть как это происходит на популярных платформах.

## Поддержка браузеров

Production сборка подразумевает поддержку для современного JavaScript. По умолчанию, Vite нацелен на браузеры, которые поддерживают [нативный ESM скрипт тег](https://caniuse.com/es6-module) и [нативный ESM dynamic import](https://caniuse.com/es6-module-dynamic-import). Как референс для Вас, Vite использует это [browserslist](https://github.com/browserslist/browserslist):

```
defaults and supports es6-module and supports es6-module-dynamic-import, not opera > 0, not samsung > 0, not and_qq > 0
```

Вы можете указать кастомные браузеры через [`build.target` config option](/config/#build-target), где самая нижняя цель - `es2015`.

Обратите внимание, по умолчанию, Bite обрабатывает только синтаксические трансформации и **не добавляет полифилов по умолчанию**. Вы можете ознакомиться с [Polyfill.io](https://polyfill.io/v3/) - сервис, который автоматически генерирует сборку полифилов основываясь на пользовательской browser UserAgent строке.

Старые браузеры могут быть поддержаны с помощью [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy), который автоматически сгенерирует legacy chunks и соответствующие полифилы для ES фич. Legacy chunks загружаются по условию только в браузерах, которые не поддерживают нативный ESM.

## Public Base Path

- Связанный раздел: [Обработка ресурсов](./assets)

Если вы деплоите ваш проект с вложенным public path, то просто укажите [`base` config option](/config/#base) и все пути на asset будут преобразованы в соответствующие пути. Этот параметр может быть также указан, как флаг командной строки, например `vite build --base=/my/public/path/`.

URL JS-импортированный ресурсов, CSS `url()` ссылки и ссылки на assets в ваших `.html` файлах все автоматически корректируются с учётом этого параметра во время сборки.

Исключение только когда вам нужно динамически сконкатенировать URL адреса на лету. В этом случае Вы можете использовать глобальную переменную `import.meta.env.BASE_URL`, которая будет являться public base путём. Заметьте, эта переменная статически заменяется во время сборки, поэтому она должна появляться в коде в таком виде как она есть (т.е. `import.meta.env['BASE_URL']` не сработает).

## Настройка сборки

Сборка может быть настроена через различные [build config options](/config/#build-options). В частности, Вы можете прямо указать [Rollup options](https://rollupjs.org/guide/en/#big-list-of-options) через `build.rollupOptions`:

```js
// vite.config.js
module.exports = defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/guide/en/#big-list-of-options
    }
  }
})
```

Например, Вы можете указать множественный (multiple) Rollup output с плагинами, которые применяются только во время сборки.

## Rebuild при изменении файлов

Вы можете активировать rollup watcher с помощью `vite build --watch`. Или Вы можете напрямую указать [`WatcherOptions`](https://rollupjs.org/guide/en/#watch-options) через `build.watch`:

```js
// vite.config.js
module.exports = defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/guide/en/#watch-options
    }
  }
})
```

## Multi-Page App (Многостраничное приложение)

Предположим, у Вас есть следующая структура проекта:

```
├── package.json
├── vite.config.js
├── index.html
├── main.js
└── nested
    ├── index.html
    └── nested.js
```

Во время dev разработки, просто переходите на `/nested/` - это работает как ожидается, так же как в обычном статическом файл-сервере.

Во время сборки (build), всё что Вам нужно сделать - это указать все `.html` файлы как точки входа (entry points):

```js
// vite.config.js
const { resolve } = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html')
      }
    }
  }
})
```

Если вы указали другой рут (корневой каталог), помните что `__dirname` всё ещё будет папкой вашего vite.config.js файла когда резолвятся input пути. Следовательно, Вам нужно будет добавить `root` entry в аргументы для `resolve`.

## Library Mode

Когда Вы разрабатываете библиотеку для браузеров, Вы вероятно тратите большинство вашего времени на test/demo страницу, которая импортит саму вашу библиотеку. С Vite Вы можете использовать `index.html` для этих целей, чтобы получить приятный development experience.

Когда пришло время собрать вашу библиотеку для её выката, используйте [`build.lib` config option](/config/#build-lib). Убедитесь что вы экстернализировали (externalize, исключили), которые вы не хотите собирать в своей библиотеке, например `vue` или `react`:

```js
// vite.config.js
const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      fileName: (format) => `my-lib.${format}.js`
    },
    rollupOptions: {
      // убедитесь, что исключили библиотеки, которые не надо собирать
      // в вашу библиотеку (library)
      external: ['vue'],
      output: {
        // Предоставляем глобальные переменные, чтобы использовать их в UMD сборке
        // для экстернализированных зависимостей
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```

Запуск `vite build` с этим конфигом использует Rollup preset, который ориентирован на генерацию (предоставление) библиотек (libraries) и производит два формата: `es` и `umd` (настраиваются через `build.lib`):

```
$ vite build
building for production...
[write] my-lib.es.js 0.08kb, brotli: 0.07kb
[write] my-lib.umd.js 0.30kb, brotli: 0.16kb
```

Рекомендуемый `package.json` файл для вашей lib (библиотеки):

```json
{
  "name": "my-lib",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.js",
  "module": "./dist/my-lib.es.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.es.js",
      "require": "./dist/my-lib.umd.js"
    }
  }
}
```
