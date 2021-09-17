---
home: true
heroImage: /logo.svg
actionText: Начать знакомство
actionLink: /guide/

altActionText: Подробнее
altActionLink: /guide/why

features:
  - title: 💡 Мгновенный запуск сервера
    details: Обработка файлов через нативный ESM, только тогда, когда эти файлы нужны, полная сборка больше не требуется!
  - title: ⚡️ Молниеносно быстрый HMR
    details: Hot Module Replacement (HMR), который остается быстрым независимо от размера приложения.
  - title: 🛠️ Обширный функционал
    details: Встроенная поддержка TypeScript, JSX, CSS.
  - title: 📦 Оптимизированная сборка
    details: Предварительно настроенная Rollup сборка с поддержкой многостраничного и библиотечного режимов.
  - title: 🔩 Универсальные плагины
    details: Rollup-superset plugin interface работает как на dev так и на build.
  - title: 🔑 Полностью типизированный API
    details: Гибкие программные API с полной типизацией TypeScript.
footer: MIT Licensed | Copyright © 2019-present Evan You & Vite Contributors
---

<div class="frontpage sponsors">
  <h2>Спонсоры</h2>
  <a v-for="{ href, src, name, id } of sponsors" :href="href" target="_blank" rel="noopener" aria-label="sponsor-img">
    <img :src="src" :alt="name" :id="`sponsor-${id}`">
  </a>
  <br>
  <a href="https://github.com/sponsors/yyx990803" target="_blank" rel="noopener">Стать спонсором на GitHub</a>
</div>

<script setup>
import sponsors from './.vitepress/theme/sponsors.json'
</script>
