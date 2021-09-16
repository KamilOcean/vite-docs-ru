# Сравнение с другими No-Bundler решениями

## Snowpack

[Snowpack](https://www.snowpack.dev/) - это также no-bundle нативный ESM dev server, который очень похож на Vite. Несмотря на различия в деталях реализаций, оба проекта имеют технические преимущества по сравнению с традиционными инструментами. Vite's dependency pre-bundling также вдохновлён Snowpack v1 (сейчас [`esinstall`](https://github.com/snowpackjs/snowpack/tree/main/esinstall)). Некоторые из главных различий в этих проектах:

**Production Build**

Output в Snopack по умолчанию не собран, разделён (unbundled): он трансформирует каждый файл в разный build модуль, который потом может быть загружен в различные "optimizers", которые уже выполняют само объединение (bundling). Преимущество такого подхода заключается в том, что вы можете выбрать решение между разными end-bundler'ами для ваших специфичных нужд (например, webpack, Rollup или даже esbuild). Недостаток в том, что это немного фрагментированный опыт - например, esbuild optimizer всё ещё нестабильный, Rollup optimizer официально не поддерживается, а другие оптимайзеры имеют различный output и конфигурации.

Vite нацелен на более глубокую интеграцию с одним бандлером (Rollup), чтобы обеспечить более упрощённый опыт. Это также позволяет Vite'у поддерживать [Universal Plugin API](./api-plugin) которые работают и для dev и для build.

Благодаря более интегрированному процессу сборки, Vite поддерживает широкий спектр функционала, который сейчас не доступен в Snowpack build оптимайзерах:

- [Multi-Page Support](./build#multi-page-app)
- [Library Mode](./build#library-mode)
- [Automatic CSS code-splitting](./features#css-code-splitting)
- [Optimized async chunk loading](./features#async-chunk-loading-optimization)
- Официальный [legacy mode plugin](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy), который генерирует два modern/legacy бандла и автоматически поставляет необходимый бандл, основываясь на поддержке браузера пользователя.

**Dependency Pre-Bundling быстрее**

Vite использует [esbuild](https://esbuild.github.io/) вместо Rollup для dependency pre-bundling (сборки зависимостей). Это приводит к значительному повышению производительности с точки зрения холодного запуска сервера и пересборке (re-building) при невалидных зависимостей (dependency invalidations).

**Поддержка Monorepo**

Vite разработан с поддержкой monorepo setups и пользователи уже активно используют его с Yarn, Yarn 2, и PNPM based monorepos.

**Поддержка CSS Pre-Processor**

Vite обеспечивает более совершенную поддержку Sass и Less, включая улучшенный `@import` resolution (алиасы "псевдонимы" и npm зависимости) и [автоматические преобразование `url()` для инлайновых файлов](./features#import-inlining-and-rebasing).

**Первоклассная поддержка Vue**

Первоначально Vite был создан, чтобы служить в качестве будущей основы [Vue.js](https://vuejs.org/) инструментария. Хотя начиная с версии 2.0 Vite сейчас полностью независим от используемого фреймворка "framework-agnostic", официальный плагин Vue всё ещё предоставляет первоклассную поддержку формата Vue's Single File Component, охватывая все продвинутые функции, такие как template asset reference resolving, `<script setup>`, `<style module>`, custom blocks и даже больше. В дополнение, Vite предоставляет детализированный HMR для Vue SFCs. Например, обновление `<template>` или `<style>` в SFC выполнит hot updates без сброса состояния приложения.

## WMR

[WMR](https://github.com/preactjs/wmr) от команды Preact предоставляет похожий набор функционала, и поддержка интерфейса плагинов Rollup в Vite 2.0 вдохновлена именно им (WMR).

WMR в основном разработан для [Preact](https://preactjs.com/) проектов, и предлагает больше интегрированных фич, таких, как pre-rendering. В наших условиях, это скорее можно назвать Preact meta фреймворк, с акцентом на компактный размер, на чём акцентируется и сам Preact. Если вы используете Preact, WMR вероятно предложит более точную настройку.

## @web/dev-server

[@web/dev-server](https://modern-web.dev/docs/dev-server/overview/) (ранее `es-dev-server`) это отличный проект и Vite 1.0's Koa-based server setup был вдохновлён именно этим проектом.

`@web/dev-server` в условиях нашего обсуждения, это немного низкоуровневый инструмент. Он не предоставляет официальных интеграций с фреймворками и требует ручной настройки конфигурации Rollup для production сборки.

В целом, Vite - это более самодостаточный / высокоуровневый инструмент, который призван обеспечивать более out-of-the-box рабочий процесс. И всё-таки, `@web` umbrella project содержит множество других прекрасных инструментов, которые также могут принести пользу Vite пользователям.
