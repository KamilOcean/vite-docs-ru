# Почему Vite

## Проблемы

До того как ES модули стали доступными в браузерах, у разработчиков не было нативного механизма для разработки настоящих модулей JavaScript. Поэтому мы с вами все знакомы с концепцией "сборки" (bundling): использование инструментов для сканирования, обработки и объединения всех исходных кодов наших модулей в файлы, которые могут работать в браузере.

Со временем появились такие инструменты как [webpack](https://webpack.js.org/), [Rollup](https://rollupjs.org) и [Parcel](https://parceljs.org/), которые значительно улучшили процесс разработки для frontend разработчиков.

Однако по мере того, как мы начинаем создавать все более и более амбициозные приложения, количество JavaScript, с которым мы имеем дело, также увеличивалось в геометрической прогрессии. Крупные проекты нередко содержат тысячи модулей. Появляется "бутылочное горлышко" (узкое место) для производительности JavaScript модулей: чтобы запустить dev server, часто может потребоваться неоправданно большое количество времени (иногда этот процесс превышает минуты!) и даже с использованием HMR (Hot Module Replacement для применения изменений без перезагрузки страницы) изменение файла может занять пару секунд прежде чем сами изменения сработают в браузере. Медленный цикл обратной связи с разрабатываемым сайтом может сильно повлиять на продуктивность и настроение разработчиков.

Vite стремится решить эти проблемы, используя новейшие разработки в экосистеме: доступность использования нативных ES модулей в браузере (современные браузеры поддерживают ES модули) и появление JavaScript инструментов написанных на compile-to-native языках.

### Медленный старт сервера

При холодном запуске "cold-starting" dev сервера bundler-based сборщик должен быстро просканировать все зависимости и собрать всё ваше приложение до того как сами файлы станут доступны на запущенном сервере.

Vite улучшает скорость запуска dev сервера, с помощью разделения всех модулей в приложении на две категории: **dependencies** (зависимости) and **source code** (исходный код).

- **Dependencies** (зависимости) в основном представляют собой чистый JavaScript, который часто не изменяется в процессе разработки. Некоторые большие зависимости (такие, как библиотеки компонентов с сотнями модулей) также довольно затратны для их обработки. Зависимости могут предоставляться в различных форматах модулей (например, ESM или CommonJS).

  Vite [pre-bundles dependencies](./dep-pre-bundling) (предварительная сборка зависимостей) использует [esbuild](https://esbuild.github.io/). Esbuild написан на Go и собирает зависимости в 10-100 раз быстрее, чем сборщики написанные на JavaScript.

- **Source code** (исходный код) часто написан не на чистом JavaScript и нам необходимо трансформировать его (например, JSX, CSS или Vue/Svelte компоненты), и эти файлы будут постоянно редактироваться. Кроме того, нам не нужно постоянно загружать весь исходный код одновременно (как пример, route-based code-splitting - разделение кода на основе роутинга).

  Vite обрабатывает исходный код с помощью [native ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). По сути это позволяет браузеру взять на себя часть работы "бандлера" (сборщика пакетов): Vite'у остаётся только преобразовывать и обрабатывать исходный код по запросу, когда браузер запрашивает это. Код условного динамического импорта обрабатывается только когда он действительно используется на текущем экране.

  ![bundler based dev server](/images/bundler.png)

  ![esm based dev server](/images/esm.png)

### Медленные обновления

Когда файл редактируется в bundler-based сборщике, неэффективно пересобирать всю сборку по очевидным причинам: скорость обновлений будет линейно снижаться в соответствии с размером приложения.

Некоторые бандлер dev серверы запускают сборку в памяти, поэтому им нужно только убрать часть из "графа" (общего списка зависимостей) когда файл измениться, но всё ещё нужно переконструировать весь собранный bundle и перезагрузить веб страницу. Реконструкция бандла может быть затратной операцией и перезагрузка страницы уничтожает текущее состояние приложения. По этой причине некоторые сборщики "бандлеры" поддерживают Hot Module Replacement (HMR): позволяя модулю самому заменяться на лету "hot replace" (горячая замена) без воздействия на другие части страницы. Это значительно улучшает DX (Developer Experience) - однако, на практике мы обнаружили, что даже скорость обновления HMR сильно ухудшается по мере роста приложения.

В Vite HMR выполняется поверх собственного ESM. Когда файл редактируется, Vite'у нужно убрать только связь между редактируемым модулем и ближайшей границей HMR (в большинстве случаев только сам модуль), что делает обновления HMR стабильно быстрыми независимо от размера вашего приложения.

Vite также использует заголовки HTTP для ускорения полной перезагрузки страницы (опять же, позволяем браузеру сделать бóльшую работу за нас): модули с исходным кодом запрашиваются через условный `304 Not Modified`, и dependency модуль (зависимости) отдаются с жёстким кешом с помощью `Cache-Control: max-age=31536000,immutable`, поэтому они больше не обрабатываются сервером, после их кеширования.

Как только вы попробуете на сколько Vite быстрый, то вы больше не захотите возвращаться к пакетным "bundle" сборщикам.

## Зачем нужен Bundle для Production

Несмотря на то, что нативный ESM в данный момент имеет широкую поддержку браузерами, предоставление несобранного ESM в production всё ещё неэффективна (даже с HTTP/2) из-за дополнительных сетевых циклов, вызванных вложенным импортом. Чтобы получить оптимальную производительность загрузки, всё ещё лучше использовать собранный bundle вашего проекта с tree-shaking, lazy-loading и разделением кода на "чанки" - chunk splitting (для лучшего кеширования).

Обеспечивать оптимальный вывод и согласованность поведения между dev сервером и production сборкой не так-то просто. Поэтому Vite поставляется с pre-configured (преднастроенной) [build command](./build), которая из коробки включает в себя многие оптимизации производительности [performance optimizations](./features#build-optimizations).

## Почему бы не использовать Bundle с esbuild?

Несмотря на то, что `esbuild` быстро развивается и уже является работоспособным сборщиком для многих библиотек, некоторые из важных фич необходимых для сборки приложений всё ещё находятся в стадии разработки - в частности code-splitting (разделение кода) и CSS handling (обработка CSS). На данный момент в этом плане Rollup - более зрелый и гибкий инструмент. Тем не менее мы не исключаем в будущем возможность сборки production build с помощью `esbuild`, когда эти фичи будут в стабильной версии.

## Чем Vite отличается от X?

Вы можете ознакомиться с [Comparisons](./comparisons) секцией для более детального обзора о том, чем Vite отличается от других похожих инструментов.
