# Функционал (Features)

На самом базовом уровне, разработка с Vite не сильно отличается от разработки с использованием статичного файлового сервера. Однако, Vite предоставляет много улучшений по сравнению с нативным ESM импортом для поддержки различных функций, которые обычно встречаются в сборщиках-бандлерах.

## NPM разрешение зависимостей (Dependency Resolving) и Pre-Bundling

Нативный ES импорт не поддерживает импорт пустых (простых) "bare" модулей (без указания точного пути) как в следующем примере:

```js
import { someMethod } from 'my-dep'
```

Вышеуказанное вызовет ошибку в браузере. Vite обнаружит такой простой импорт модуля во всех обрабатываемых сервером файлах и выполнит следующее:

1. [Pre-bundle](./dep-pre-bundling) (пре соберёт) их, чтобы улучшить скорость загрузки страниц и сконвертирует CommonJS / UMD модули в ESM. Pre-bundling (пре-сборка) выполняется с помощью [esbuild](http://esbuild.github.io/) и делает холодный старт Vite проекта значительно быстрее, чем старт такого же проекта на любом другом JavaScript бандлере.

2. Заменит импорты на валидные URL, на подобии `/node_modules/.vite/my-dep.js?v=f3sf2ebd` и после этого браузер сможет импортировать эти модули корректно.

**Dependencies (зависимости) жёстко кэшируются**

Vite кэширует запросы зависимостей через HTTP-заголовки, поэтому, если вы хотите локально редактировать / отлаживать зависимость (dependency), выполните следующие действия описанные [здесь](./dep-pre-bundling#browser-cache).

## Hot Module Replacement

Vite предоставляет [HMR API](./api-hmr) поверх нативного ESM. Фрэймворки с возможностями HMR могут воспользоваться этим API для предоставления моментальных, точных обновлений без перезагрузки страницы или уничтожения всего состояния приложения. Vite имеет "first-party" (собственные, встроенные) HMR интеграции для [Vue Single File Components](https://github.com/vitejs/vite/tree/main/packages/plugin-vue) и [React Fast Refresh](https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh). Также есть официальные интеграции для Preact с помощью [@prefresh/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite).

Обратите внимание, что Вам не нужно настраивать всё это вручную, если вы [создаёте приложение с помощью `create-vite`](./), в выбранных шаблонах всё уже будет настроено для Вас.

## TypeScript

Vite поддерживает импорт `.ts` файлов прямо из коробки.

Vite выполняет только транспиляцию `.ts` файлов и **НЕ** выполняет проверку типов (type checking). Предполагается, что проверка типов (type checking) выполняется на стороне вашей IDE и процесса сборки (build proccess). Вы можете добавить `tsc --noEmit` в build script или установить `vue-tsc` и запустить `vue-tsc --noEmit` также, для того чтобы добавить проверку типов в ваши `*.vue` файлы.

Vite использует [esbuild](https://github.com/evanw/esbuild) для транспиляции TypeScript в JavaScript, который в 20~30 раз быстрее чем обычный `tsc`, и HMR обновления могут быть отражены в браузере в течение 50ms.

### Параметры компилятора TypeScript

Некоторые свойства (поля) конфигурации в разделе `compilerOptions` в `tsconfig.json` требуют особого внимания.

#### `isolatedModules`

Должно быть установлено как `true`.

Это потому что `esbuild` выполняет только транспиляцию без информации о типах, он не поддерживает определённые функции, такие как const enum и implicit type-only импорт.

Вы должны установить `"isolatedModules": true` в вашем `tsconfig.json` в `compilerOptions`, так TS будет предупреждать вас о функциях, которые не работают с изолированной транспиляцией (isolated transpilation).

#### `useDefineForClassFields`

Начиная с Vite 2.5.0, значение по умолчанию будет `true` если TypeScript target - `ESNext`. Это соответствует с [поведением `tsc` 4.3.2 и более поздние версии](https://github.com/microsoft/TypeScript/pull/42663). Это также стандартное поведение среды выполнения ECMAScript.

Но это может показаться нелогичным для тех, кто использует другие языки программирования или более старые версии TypeScript.
Вы можете узнать больше о переходе тут: [TypeScript 3.7 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#the-usedefineforclassfields-flag-and-the-declare-property-modifier).

Если вы используете библиотеку, которая сильно зависит от полей класса (class fields), будьте осторожны с предполагаемым использованием этой библиотеки.

Большинство библиотек ожидают `"useDefineForClassFields": true`, такие, как [MobX](https://mobx.js.org/installation.html#use-spec-compliant-transpilation-for-class-properties), [Vue Class Components 8.x](https://github.com/vuejs/vue-class-component/issues/465), и т.д.

Но некоторые библиотеки еще не перешли на это новое значение по умолчанию, включая [`lit-element`](https://github.com/lit/lit-element/issues/1030). Пожалуйста, установите явно для `useDefineForClassFields` значение `false` в этих случаях.

#### Другие опции компилятора, влияющие на результат сборки

- [`extends`](https://www.typescriptlang.org/tsconfig#extends)
- [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues)
- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)

### Клиентские типы (Client Types)

Типы Vite по умолчанию предназначены для его API Node.js. Чтобы включить клиентскую часть кода в приложении Vite, добавьте файл декларации `d.ts`:

```typescript
/// <reference types="vite/client" />
```

Также, Вы можете добавить `vite/client` в `compilerOptions.types` в вашем `tsconfig`:

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

Это предоставит следующие typs shims:

- Asset imports (например, импорт `.svg` файлов)
- Типы для Vite-injected [env variables](./env-and-mode#env-variables) в `import.meta.env`
- Типы для [HMR API](./api-hmr) в `import.meta.hot`

## Vue

Vite обеспечивает первоклассную поддержку Vue:

- Vue 3 SFC работает с помощью [@vitejs/plugin-vue](https://github.com/vitejs/vite/tree/main/packages/plugin-vue)
- Vue 3 JSX работает с помощью [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite/tree/main/packages/plugin-vue-jsx)
- Vue 2 работает с помощью [underfin/vite-plugin-vue2](https://github.com/underfin/vite-plugin-vue2)

## JSX

`.jsx` и`.tsx` файлы также поддерживаются из коробки. JSX также работает через [esbuild](https://esbuild.github.io), и по умолчанию используется React 16 версии. Поддержку JSX в стиле React 17 в esbuild можно отслеживать [тут](https://github.com/evanw/esbuild/issues/334).


Пользователи Vue должны использовать официальный плагин [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite/tree/main/packages/plugin-vue-jsx), который предоставляет специальные функции Vue 3, включая HMR, глобальное разрешение компонентов (global component resolving), директивы (directives) и слоты (slots).

Если JSX не используется с React или Vue, пользовательские `jsxFactory` и` jsxFragment` могут быть настроены с помощью [`esbuild` option](/config/#esbuild). Например, для Preact:

```js
// vite.config.js
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
})
```

Больше деталей в [esbuild docs](https://esbuild.github.io/content-types/#jsx).

Вы можете внедрить JSX helpers с помощью `jsxInject` (который доступен только для Vite), чтобы избежать ручного импорта:

```js
// vite.config.js
export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`
  }
})
```

## CSS

При импорте файлов `.css` их содержимое будет вставлено на страницу с помощью тега `<style>` с поддержкой HMR. Вы также можете получить обработанный CSS в виде строки в качестве экспорта модуля по умолчанию (default export).

### `@import` Inlining и Rebasing (Встраивание и преобразование)

Vite предварительно настроен для поддержки CSS `@ import` инлайном через` postcss-import`. Vite aliases также поддерживаются для CSS `@ import`. Кроме того, все ссылки CSS `url ()`, даже если импортированные файлы находятся в разных директориях, всегда автоматически преобразуются для обеспечения корректности.


`@import` alias'ы и URL преобразования также поддерживаются для Sass и Less файлов (смотрите [CSS Pre-processors](#css-pre-processors)).

### PostCSS

Если проект содержит допустимую конфигурацию PostCSS (любой форматт поддерживаемый [postcss-load-config](https://github.com/postcss/postcss-load-config), например, `postcss.config.js`), то этот конфиг будет автоматически применяться ко всем импортируемым файлам CSS.

### CSS Modules

Любой файл CSS, заканчивающийся на `.module.css`, считается [файлом CSS модуля](https://github.com/css-modules/css-modules). Импорт такого файла вернет соответствующий объект модуля:

```css
/* example.module.css */
.red {
  color: red;
}
```

```js
import classes from './example.module.css'
document.getElementById('foo').className = classes.red
```

Поведение CSS модулей можно настроить с помощью [`css.modules` параметра](/config/#css-modules).

Если `css.modules.localsConvention` выставлено в значение enable camelCase locals (например, `localsConvention: 'camelCaseOnly'`), вы также можете использовать именованный импорт:

```js
// .apply-color -> applyColor
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### CSS Pre-processors

Поскольку Vite нацелен только на современные браузеры, рекомендуется использовать собственные переменные CSS с плагинами PostCSS, которые реализуют черновики CSSWG (например, [postcss-nesting](https://github.com/jonathantneal/postcss-nesting)) и авторский простой, future-standards-compliant CSS.

Тем не менее Vite обеспечивает встроенную поддержку файлов `.scss`, `.sass`, `.less`, `.styl` и `.stylus`. Для них нет необходимости устанавливать специальные плагины для Vite, но должен быть установлен сам соответствующий препроцессор:

```bash
# .scss and .sass
npm install -D sass

# .less
npm install -D less

# .styl and .stylus
npm install -D stylus
```

Если вы используете Vue single file components (однофайловые компоненты), то в них также автоматически доступно `<style lang="sass">` и другие препроцессоры.

Vite улучшает обработку `@import` для Sass и Less, поэтому Vite aliases также учитываются. Более того, относительные `url()` ссылки внутри импортированных Sass/Less файлов, которые в других директориях, отличных от корневого файла, также автоматически преобразуются для консистентности.

`@import` alias и url преобразования не поддерживаются для Stylus из-за его ограничений в API.

Вы также можете использовать CSS модули в сочетании с препроцессорами, добавив `.module` к расширению файла, например `style.module.scss`.

## Static Assets (Статичные ресурсы)

Импортирование статичных ресурсов (static assets) вернёт преобразованный public URL, когда он обрабатывается сервером:

```js
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Специальные query параметры могут модифицировать способ загрузки ресурсов:

```js
// Явно загрузить ресурсы как URL
import assetAsURL from './asset.js?url'
```

```js
// Загрузить ресурс как строку
import assetAsString from './shader.glsl?raw'
```

```js
// Загрузить Web Workers
import Worker from './worker.js?worker'
```

```js
// Web Workers встроены инлайном как строки base64 во время сборки
import InlineWorker from './worker.js?worker&inline'
```

Больше деталей в разделе [Управление статическими ресурсами (Static Asset Handling)](./assets).

## JSON

JSON файлы могут быть импортированы напрямую - также поддерживается именованный импорт:

```js
// импорт целого объекта
import json from './example.json'
// импорт корневого поля field как именованный экспорт - помогает с treeshaking!
import { field } from './example.json'
```

## Glob Import

Vite поддерживает импорт множественных модулей из файловой системы с помощью специальной функции `import.meta.glob`:

```js
const modules = import.meta.glob('./dir/*.js')
```

Вышеуказанное будет трансформировано в следующий код:

```js
// code produced by vite
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
  './dir/bar.js': () => import('./dir/bar.js')
}
```

Затем Вы можете пройтись по всем ключам объекта `modules`, чтобы получить доступ к соответствующим модулям:

```js
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

Соответствующие файлы по умолчанию загружаются через динамический импорт (dynamic import) в отложенном режиме (lazy load) и будут разбиты на отдельные чанки (chunks) во время сборки. Если вы предпочитаете импортировать все модули напрямую (например, если в этих модулях есть побочные эффекты (side-effects), которые должны быть применены первыми), то вы можете вместо этого использовать `import.meta.globEager:

```js
const modules = import.meta.globEager('./dir/*.js')
```

Вышеуказанное будет трансформировано в следующий код:

```js
// code produced by vite
import * as __glob__0_0 from './dir/foo.js'
import * as __glob__0_1 from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1
}
```

Заметьте:

- Это чисто функция (фича) Vite и это не Web или ES стандарт.
- Шаблоны glob обрабатываются как спецификации import: они должны быть относительными (начинаются с `./`) или абсолютными (начинаются с `/`, обрабатывается как относительно корня проекта).
- Сопоставление glob шаблонов выполняется с помощью `fast-glob` - смотрите документацию [поддержка glob шаблонов (patterns)](https://github.com/mrmlnc/fast-glob#pattern-syntax).

## WebAssembly

Предварительно скомпилированные файлы `.wasm` можно напрямую импортировать - экспорт по умолчанию будет функцией инициализации, которая возвращает Promise экспортируемого объекта экземпляра wasm:

```js
import init from './example.wasm'

init().then((exports) => {
  exports.test()
})
```

Функция init также может принимать объект `import`, который передается в` WebAssembly.instantiate` в качестве второго аргумента:

```js
init({
  imports: {
    someFunc: () => {
      /* ... */
    }
  }
}).then(() => {
  /* ... */
})
```

В production сборке файлы `.wasm` меньше, чем `assetInlineLimit`, будут встроены как строки base64. В противном случае они будут скопированы в каталог dist как ресурс (asset) и извлечены по запросу.

## Web Workers

Скрипт веб-воркера можно напрямую импортировать, добавив к запросу при импортировании `?worker` или `?sharedworker`. По умолчанию экспортируется custom worker constructor:

```js
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

Worker script также может использовать операторы `import` вместо `importScripts()` - обратите внимание, что во время разработки это зависит от встроенной поддержки браузера и в настоящее время работает только в Chrome, но для производственной сборки он компилируется.

По умолчанию worker script будет выпущен как отдельный блок в production сборке. Если вы хотите встроить воркер инлайном как строки base64, добавьте query параметр `inline`:

```js
import MyWorker from './worker?worker&inline'
```

## Оптимизация сборки

> Перечисленный ниже функционал автоматически применяется как часть сборочного процесса (build process) и не нужно никакой явной конфигурации для этого, если только вы не захотите что-то отключить.

### CSS Code Splitting (Разделение CSS кода)

Vite автоматически извлекает CSS, используемый модулями в асинхронный чанк (async chunk) и генерирует отдельный файл для этого. CSS файл автоматически грузится через `<link>` тэг когда загружается связанный с ним асинхронный чанк, а асинхронный чанк гарантировано выполняется только после загрузки CSS, чтобы избежать [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content#:~:text=A%20flash%20of%20unstyled%20content,before%20all%20information%20is%20retrieved.).

Если вы хотите, чтобы весь CSS был извлечен в один файл, вы можете отключить разделение кода CSS, установив для [`build.cssCodeSplit`](/config/#build-csscodesplit) значение `false`.

### Preload Directives Generation (Генерация директив предварительной загрузки)

Vite автоматически генерирует директивы `<link rel = "modulepreload">` для entry chunks и их прямого импорта во встроенном HTML.

### Async Chunk Loading Optimization (Оптимизация загрузки асинхронных чанков)

В реальных приложениях, Rollup часто генерирует «общие» чанки - код, который используется совместно с другими двумя или более чанками. В сочетании с динамическим импортом довольно часто встречается следующий сценарий:

![graph](/images/graph.png)

В не оптимизированных сценариях, когда асинхронный чанк `A` импортируется, браузер должен будет запросить и спарсить` A`, прежде чем он сможет определить, что ему также нужен общий фрагмент `C`. Это приводит к дополнительному сетевому обходу (extra network roundtrip):

```
Entry ---> A ---> C
```

Vite автоматически перезаписывает code-split dynamic import вызовы с шагом предварительной загрузки, поэтому когда `A` запрашивается, `C` также грузится **параллельно**:

```
Entry ---> (A + C)
```

Также возможно, что `C` будет иметь ещё импорты дальше, которые приведут к ещё большему количеству обходов (roundtrips) в не оптимизированном сценарии. Оптимизированный Vite будет отслеживать все прямые импорты, чтобы полностью исключить эти обходы (roundtrips) независимо от глубины импортирования.
