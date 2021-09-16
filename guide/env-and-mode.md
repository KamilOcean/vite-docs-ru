# Env переменные и Modes

## Env переменные

> Примечание переводчика: env variables - переменные окружающей среды, но для упрощения в тексте будет использоваться просто термин env переменные. Также mode - режим, но в тексте будут взаимозаменяемо использоваться оба термина.

Vite отдаёт env переменные в специальном объекте **`import.meta.env`**. Некоторые встроенные (built-in) переменные доступны в любых случаях:

- **`import.meta.env.MODE`**: {string} [mode](#modes) в котором запущено приложение.

- **`import.meta.env.BASE_URL`**: {string} base url, по которому доступно приложение. Это определено с помощью [`base` config option](/config/#base).

- **`import.meta.env.PROD`**: {boolean} запущено ли приложение как production.

- **`import.meta.env.DEV`**: {boolean} запущено ли приложение как development (всегда обратное значению `import.meta.env.PROD`)

### Production замена

Во время production, эти env переменные **заменяются статически**. Поэтому необходимо всегда ссылаться на них, используя полную статическую строку. Например, dynamic key access (динамический доступ по ключу) как `import.meta.env[key]` не будет работать.

Также эти строки заменятся, если они появятся в JavaScript строках и Vue templates. Это редко когда может случиться, но всё же может произойти непреднамеренно. В этом случае вы сможете увидеть такие ошибки: `Missing Semicolon` или `Unexpected token`, например, когда `"process.env.NODE_ENV: "` трансформируется в `""development": "`. Вот пути, как разрешить эту ситуацию:

- Для JavaScript строк, вы можете вставить в строку unicode zero-width space, например, `'import.meta\u200b.env.MODE'`.

- Для Vue templates или других HTML строк, которые компилируются в строку JavaScript, вы можете использовать [`<wbr>` tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/wbr), например, `import.meta.<wbr>env.MODE`.

## `.env` Файлы

Vite использует [dotenv](https://github.com/motdotla/dotenv) чтобы загрузить дополнительные environment переменные из следующих файлов в вашей [environment directory](/config/#envdir):

```
.env                # загружается в любых случаях
.env.local          # загружается в любых случаях, игнорируется git'ом
.env.[mode]         # загружается только в указанном mode
.env.[mode].local   # загружается только в указанном mode, игнорируется git'ом
```

Загруженные env переменные также доступны клиентскому исходному коду через `import.meta.env`.

Чтобы предотвратить случайную утечку env переменных клиенту, только переменные с префиксом `VITE_` отдаются Vite-processed коду. Например, в следующем файле:

```
DB_PASSWORD=foobar
VITE_SOME_KEY=123
```

Только переменная `VITE_SOME_KEY` будет отдана `import.meta.env.VITE_SOME_KEY` вашему клиентскому исходному коду, а `DB_PASSWORD` не будет доступен там.

Если вы хотите кастомизировать префикс для env переменных, смотрите параметр [envPrefix](/config/index#envprefix).

:::warning Предостережение о безопасности

- `.env.*.local` файлы - локальные файлы (local-only) и они могут содержать важные переменные. Вам следует добавить `.local` в ваш `.gitignore` файл, чтобы избежать их сохранения в истории git.

- Поскольку любые переменные переданные Vite исходному коду, попадут в клиентскую сборку, `VITE_*` переменные  _не_ должны содержать значимую, важную информацию.
  :::

### IntelliSense

По умолчанию, Vite предоставляет определение типов для `import.meta.env`. Хотя вы можете определить больше пользовательских переменных в `.env.[mode]`файлах, возможно вам захочется использовать TypeScript IntelliSense для определённых пользователем (user-defined) env переменных с префиксом `VITE_`.

Чтобы сделать это, вы можете создать файл `env.d.ts` в`src` директории, затем расширить `ImportMetaEnv` на примере этого:

```typescript
interface ImportMetaEnv {
  VITE_APP_TITLE: string
  // more env variables...
}
```

## Modes

По умолчанию, dev сервер (`serve` команда) запускается в `development` mode (режиме), и `build` команда запускает сервер в `production` mode.

Это значит, что когда вы запускаете `vite build`, он загрузит env переменные из `.env.production` если есть они есть:

```
# .env.production
VITE_APP_TITLE=My App
```

В вашем приложении, вы можете вывести title используя `import.meta.env.VITE_APP_TITLE`.

Однако, важно понимать, что **mode** более широкое понятие, чем просто development vs. production. Типичный пример, когда вам захочется иметь "staging" mode, где вы сможете видеть production-like поведение приложения, но с немного другими env переменными, а не с теми переменными, которые используются в production.

Вы можете переписать дефолтный mode используемый командами, передав опциональный флаг `--mode`. Например, если вы хотите собрать ваше приложение для нашего гипотетического staging режима:

```bash
vite build --mode staging
```

И чтобы получить желаемое поведение, нам нужен `.env.staging` файл:

```
# .env.staging
NODE_ENV=production
VITE_APP_TITLE=My App (staging)
```

Сейчас ваше staging приложение должно иметь production-like поведение, но отображать другой заголовок, отличный от production версии.
