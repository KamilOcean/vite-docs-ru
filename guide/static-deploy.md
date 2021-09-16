# Деплой статичного сайта

Данное руководство основано на некоторых общих предположениях:

- Вы используете дефолтный output location (`dist`). Эта локация [может быть изменена с помощью `build.outDir`](https://vitejs.dev/config/#build-outdir), и в этом случае Вы можете экстраполировать (extrapolate) инструкции из этого гайда.
- Вы используете npm. Вы можете использовать эквивалентные команды, чтобы запустить скрипты, если Вы используете Yarn или другой пакетный менеджер.
- Vite установлен как локальная dev зависимость (dependency) в вашем проекте, и у вас настроены следующие npm скрипты:

```json
{
  "scripts": {
    "build": "vite build",
    "serve": "vite preview"
  }
}
```

Важно, что `vite preview` предназначен для предпросмотра сборки локально и не подразумевается как production сервер.

::: tip Заметка
Это руководство предоставляет инструкции для выполнения статического деплоя вашего Vite сайта. Vite также имеет экспериментальную поддержку для Server Side Rendering'а. SSR относится к front-end фреймворкам, которые могут запускать одно и тоже приложение на Node.js, использовать pre-rendering в HTML, и наконец-то гидратировать (hydrating) это на клиенте. Ознакомьтесь с [SSR руководство](./ssr) чтобы узнать больше об этом. С другой стороны, если Вы ищете интеграцию с традиционными server-side фреймворками, посмотрите лучше вот это [Backend Integration guide](./backend-integration).
:::

## Сборка приложения

Вы можете запустить команду `npm run build`, чтобы собрать приложение.

```bash
$ npm run build
```

По умолчанию, output сборки будет размещён в папке `dist`. Вы можете вылить эту папку `dist` на любую нужную вам платформу.

### Локальное тестирование приложения

Разработав приложение, Вы можете протестировать его локально запустив команду `npm run serve`.

```bash
$ npm run build
$ npm run serve
```

Команда `vite preview` поднимет локальный статичный веб сервер, который будет обрабатывать файлы из папки `dist` по адресу http://localhost:5000. Это самый лёгкий путь, чтобы проверить локально, что ваша production сборка (build) в порядке.

Вы можете настроить порт сервера, передав флаг `--port` как аргумент.

```json
{
  "scripts": {
    "serve": "vite preview --port 8080"
  }
}
```

Сейчас `preview` метод запустит сервер на http://localhost:8080.

::: tip Заметка
Если вы поменяете название скрипта с `serve` на `preview`, то вы можете столкнуться с некоторыми проблемами package managers, связанными со способом их обработки [Pre & Post scripts](https://docs.npmjs.com/cli/v7/using-npm/scripts#pre--post-scripts).
:::

## GitHub Pages

1. Установите корректный `base` в `vite.config.js`.

   Если Вы деплоите на `https://<USERNAME>.github.io/`, вы можете не менять `base` так как по умолчанию это `'/'`.

   Если вы деплоите на `https://<USERNAME>.github.io/<REPO>/`, например, ваш репозиторий`https://github.com/<USERNAME>/<REPO>`, то установите `base` в значение `'/<REPO>/'`.

2. Внутри вашего проекта, создайте файл `deploy.sh` со следующим содержимым (с правильно раскомментированными выделенными строками), и выполните файл как bash команду для деплоя:

   ```bash{13,20,23}
   #!/usr/bin/env sh

   # abort on errors
   set -e

   # build
   npm run build

   # navigate into the build output directory
   cd dist

   # если вы деплоите на кастомный домен
   # echo 'www.example.com' > CNAME

   git init
   git add -A
   git commit -m 'deploy'

   # если вы деплоите на https://<USERNAME>.github.io
   # git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

   # если вы деплоите на https://<USERNAME>.github.io/<REPO>
   # git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

   cd -
   ```

::: tip Подсказка
Вы также можете запускать вышеуказанный скрипт в вашей CI настройке, чтобы иметь автоматический деплой при каждом пуше новых изменений.
:::

### GitHub Pages и Travis CI

1. Установите нужный `base` в `vite.config.js`.

   Если вы деплоите на `https://<USERNAME or GROUP>.github.io/`, вы можете не указывать `base` так как по умолчанию он `'/'`.

   Если вы деплоите на `https://<USERNAME or GROUP>.github.io/<REPO>/`, например, ваш репозиторий `https://github.com/<USERNAME>/<REPO>`, тогда установите`base` в значение `'/<REPO>/'`.

2. Создайте файл с именем`.travis.yml` в корне вашего проекта.

3. Запустите команду `npm install` локально и закоммитьте сгенерированный lockfile (`package-lock.json`).

4. Используйте GitHub Pages deploy provider template, и следуйте [Travis CI документации](https://docs.travis-ci.com/user/deployment/pages/).

   ```yaml
   language: node_js
   node_js:
     - lts/*
   install:
     - npm ci
   script:
     - npm run build
   deploy:
     provider: pages
     skip_cleanup: true
     local_dir: dist
     # A token generated on GitHub allowing Travis to push code on you repository.
     # Set in the Travis settings page of your repository, as a secure variable.
     github_token: $GITHUB_TOKEN
     keep_history: true
     on:
       branch: master
   ```

## GitLab Pages и GitLab CI

1. Установите нужный `base` в`vite.config.js`.

   Если вы деплоите на `https://<USERNAME or GROUP>.gitlab.io/`, вы можете не указывать `base` так как по умолчанию он `'/'`.

   Если вы деплоите на `https://<USERNAME or GROUP>.gitlab.io/<REPO>/`, например, ваш репозиторий `https://gitlab.com/<USERNAME>/<REPO>`, то установите `base` в значение `'/<REPO>/'`.

2. Создайте файл с названием `.gitlab-ci.yml` в корневой директории вашего проекта с содержимым, приведённым ниже. Это соберёт и задеплоит ваш сайт когда бы вы не сделали изменения в вашем контенте:

   ```yaml
   image: node:16.5.0
   pages:
     stage: deploy
     cache:
       key:
         files:
           - package-lock.json
         prefix: npm
       paths:
         - node_modules/
     script:
       - npm install
       - npm run build
       - cp -a dist/. public/
     artifacts:
       paths:
         - public
     rules:
       - $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
   ```

## Netlify

1. На [Netlify](https://netlify.com), настройте новый проект из GitHub со следующими настройками:

   - **Build Command:** `vite build` или `npm run build`
   - **Publish directory:** `dist`

2. Нажмите кнопку deploy.

## Google Firebase

1. Убедитесь что у вас есть установленный [firebase-tools](https://www.npmjs.com/package/firebase-tools).

2. Создайте файлы `firebase.json` и `.firebaserc` в корневой директории вашего проекта со следующим содержимым:

   `firebase.json`:

   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": []
     }
   }
   ```

   `.firebaserc`:

   ```js
   {
     "projects": {
       "default": "<YOUR_FIREBASE_ID>"
     }
   }
   ```

3. После запуска команды `npm run build`, задеплойте используя команду `firebase deploy`.

## Surge

1. Сначала установите [surge](https://www.npmjs.com/package/surge), если вы ещё этого не сделали.

2. Запустите `npm run build`.

3. Задеплойте, набрав `surge dist`.

Вы также можете деплоить на кастомный домен [custom domain](http://surge.sh/help/adding-a-custom-domain) добавив `surge dist yourdomain.com`.

## Heroku

1. Установите [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).

2. Создайте Heroku аккаунт с помощью [signing up](https://signup.heroku.com).

3. Запустите `heroku login` и залогиньтесь:

   ```bash
   $ heroku login
   ```

4. Создайте файл с именем`static.json` в корневом каталоге вашего проекта со следующим контентом:

   `static.json`:

   ```json
   {
     "root": "./dist"
   }
   ```

   Это конфигурация вашего сайта; читайте больше тут [heroku-buildpack-static](https://github.com/heroku/heroku-buildpack-static).

5. Настройте ваш Heroku git remote:

   ```bash
   # version change
   $ git init
   $ git add .
   $ git commit -m "My site ready for deployment."

   # creates a new app with a specified name
   $ heroku apps:create example

   # set buildpack for static sites
   $ heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static.git
   ```

6. Задеплойте свой сайт:

   ```bash
   # publish site
   $ git push heroku master

   # opens a browser to view the Dashboard version of Heroku CI
   $ heroku open
   ```

## Vercel

Чтобы задеплоить ваше Vite приложение с помощью [Vercel for Git](https://vercel.com/docs/git), убедитесь, что проект был запушен в Git репозиторий.

Перейдите на https://vercel.com/import/git и импортируйте проект в Vercel выбрав Git из меню (GitHub, GitLab or BitBucket). Следуйте указаниями, чтобы выбрать корневой каталог проекта с `package.json` и перезапишите build step используя `npm run build` и output dir будет `./dist`

![Override Vercel Configuration](../images/vercel-configuration.png)

После того как ваш проект симпортирован, все последующие пуши в ветки сгенерируют Preview Deployments, и все изменения сделанные в (обычно это "main") отразятся в Production Deployment.

Задеплоив свой преокт один раз, вы получите URL адрес, чтобы смотреть на своё приложение в живую, как пример: https://vite.vercel.app

## Azure Static Web Apps

Вы можете быстро задеплоить ваше Vite приложение с помощью сервиса Microsoft Azure [Static Web Apps](https://aka.ms/staticwebapps). Вам нужно:

- Azure аккаунт и subscription key. Вы можете создать [бесплатный Azure аккаунт здесь](https://azure.microsoft.com/free).
- Код вашего приложения пушите на [GitHub](https://github.com).
- [SWA Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps) в [Visual Studio Code](https://code.visualstudio.com).

Установите расширение для VS Code и перейдите в корень вашего приложения. Откройте Static Web Apps extension, залогиньтесь в Azure и нажмите `+` знак для создания нового Static Web App. Вас попросят указать, какой subscription key использовать.

Следуйте инструкциям из расширения, чтобы дать вашему приложению имя, выберите настройки фреймворка и укажите корень приложения (обычно `/`) и built file location (путь для сборки) `/dist`. Программа запуститься и создаст GitHub action в вашем репозитории в папке `.github`.

Это действие будет работать, чтобы деплоить ваше приложение (смотрите прогресс в вашем репо, во вкладке Actions) и когда это успешно завершится, вы сможете увидеть своей приложение по адресу, предоставленному окном расширения, когда нажмете  'Browse Website' кнопку, она появится когда GitHub action запуститься.
