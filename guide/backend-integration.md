# Backend интеграция

:::tip Заметка
Если вы хотите сёрвить HTML используя традиционный backend (например, Rails, Laravel), но хотите использовать Vite для обработки ресурсов (assets), то посмотрите существующий список интеграций в [Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends).

Если Вам нужна кастомная интеграция, вы можете следовать инструкциям, описанным в этом руководстве, чтобы настроить всё самостоятельно.
:::

1. В вашем Vite config файле, настройте entry и включите build manifest:

   ```js
   // vite.config.js
   export default defineConfig({
     build: {
       // generate manifest.json in outDir
       manifest: true,
       rollupOptions: {
         // перепишите дефолтный .html entry
         input: '/path/to/main.js'
       }
     }
   })
   ```

   Если вы не отключали [module preload polyfill](/config/#build-polyfillmodulepreload), вам также нужно заимпортить полифилы в вашем entry

   ```js
   // добавьте в начале вашего app entry
   import 'vite/modulepreload-polyfill'
   ```

2. Для разработки, вставьте следующий код в ваш server's HTML шаблон (заменить`http://localhost:3000` с локальным URL, где запущен Vite):

   ```html
   <!-- if development -->
   <script type="module" src="http://localhost:3000/@vite/client"></script>
   <script type="module" src="http://localhost:3000/main.js"></script>
   ```

   Также убедитесь, что сервер сконфигурирован для обработки статичных ресурсов (assets) в рабочей директории Vite, иначе assets, такие, как картинки не будут правильно грузиться.

   Заметьте, если вы используете React с `@vitejs/plugin-react-refresh`, вам также надо будет добавить это до вышеупомянутого скрипта, поскольку плагин не может изменять HTML код, который вы сёрвите:

   ```html
   <script type="module">
     import RefreshRuntime from 'http://localhost:3000/@react-refresh'
     RefreshRuntime.injectIntoGlobalHook(window)
     window.$RefreshReg$ = () => {}
     window.$RefreshSig$ = () => (type) => type
     window.__vite_plugin_react_preamble_installed__ = true
   </script>
   ```

3. Для production: после запуска `vite build`, `manifest.json` файл будет сгенерирован рядом с другими asset файлами. Примерный manifest файл выглядит вот так:

   ```json
   {
     "main.js": {
       "file": "assets/main.4889e940.js",
       "src": "main.js",
       "isEntry": true,
       "dynamicImports": ["views/foo.js"],
       "css": ["assets/main.b82dbe22.css"],
       "assets": ["assets/asset.0ab0f9cd.png"]
     },
     "views/foo.js": {
       "file": "assets/foo.869aea0d.js",
       "src": "views/foo.js",
       "isDynamicEntry": true,
       "imports": ["_shared.83069a53.js"]
     },
     "_shared.83069a53.js": {
       "file": "assets/shared.83069a53.js"
     }
   }
   ```

   - Manifest имеет структуру `Record<name, chunk>`
   - Для entry или dynamic entry chunks, ключ - это относительный src путь из корня проекта.
   - Для не entry chunks, ключ - это base name сгенерированного файла с префиксом `_`.
   - Chunks будут содержать информацию о их статичных и динамичных импортах (оба ключа, которые мапятся с соответствующим чанком в манифесте), и также это соответствует CSS и asset файлам (если они есть).

   Вы можете использовать этот файл для рендера ссылок или preload directives с хэшированными названиями файлов (запомните: приведённый здесь синтаксис только для ознакомления, замените его своим server templating language):

   ```html
   <!-- if production -->
   <link rel="stylesheet" href="/assets/{{ manifest['main.js'].css }}" />
   <script type="module" src="/assets/{{ manifest['main.js'].file }}"></script>
   ```
