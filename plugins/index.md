# Плагины

:::tip Заметка
Vite призван обеспечить поддержку всех популярных паттернов web разработки из коробки "out-of-the-box". До того как вы начнёте искать Vite или совместимый Rollup плагин, проверьте раздел [Руководство - функционал](../guide/features.md). В большинстве случаев, в которых вам нужен плагин в Rollup проекте, он уже будет в Vite.
:::

## Официальные плагины

### [@vitejs/plugin-vue](https://github.com/vitejs/vite/tree/main/packages/plugin-vue)

- Предоставляет поддержку Vue 3 Single File Components.

### [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite/tree/main/packages/plugin-vue-jsx)

- Предоставляет поддержку Vue 3 JSX (с помощью [dedicated Babel transform](https://github.com/vuejs/jsx-next)).

### [@vitejs/plugin-react-refresh](https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh)

- Предоставляет поддержку React Fast Refresh.

### [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

- Предоставляет поддержку устаревших "legacy" браузеров для production сборки (build).

## Плагины сообщества

Посмотрите [awesome-vite](https://github.com/vitejs/awesome-vite#plugins) - вы также можете сделать PR, чтобы добавить в список свой плагин.

## Rollup плагины

[Vite plugins](../guide/api-plugin) - это расширения Rollup's plugin interface. Смотрите [Rollup Plugin Compatibility section](../guide/api-plugin#rollup-plugin-compatibility) для большей информации.
