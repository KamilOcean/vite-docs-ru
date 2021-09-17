import{o as n,c as a,d as s}from"./app.877e1a61.js";const e='{"title":"Использование плагинов","description":"","frontmatter":{},"headers":[{"level":2,"title":"Добавление плагина","slug":"добавnение-пnагина"},{"level":2,"title":"Поиск плагинов","slug":"поиск-пnагинов"},{"level":2,"title":"Обеспечение порядка плагинов","slug":"обеспечение-порядка-пnагинов"},{"level":2,"title":"Условное приложение","slug":"усnовное-приnожение"},{"level":2,"title":"Создание плагинов","slug":"создание-пnагинов"}],"relativePath":"guide/using-plugins.md","lastUpdated":1631745414687}',p={},t=[s('<h1 id="испоnьзование-пnагинов" tabindex="-1">Использование плагинов <a class="header-anchor" href="#испоnьзование-пnагинов" aria-hidden="true">#</a></h1><p>Функционал Vite может быть расширен с помощью плагинов, которые основываются на хорошо спроектированном интерфейсе плагинов Rollup с несколькими дополнительными Vite-специфичными опциями. Это значит, что Vite пользователи могут положиться на развитую экосистему Rollup плагинов, а также при необходимости есть возможность расширять функциональность dev сервера и SSR функциональности.</p><h2 id="добавnение-пnагина" tabindex="-1">Добавление плагина <a class="header-anchor" href="#добавnение-пnагина" aria-hidden="true">#</a></h2><p>Чтобы использовать плагин, его нужно добавить в <code>devDependencies</code> проекта и включить в массив <code>plugins</code> в файле <code>vite.config.js</code>. Например, чтобы предоставить поддержку старых браузеров, можно использовать официальный плагин <a href="https://github.com/vitejs/vite/tree/main/packages/plugin-legacy" target="_blank" rel="noopener noreferrer">@vitejs/plugin-legacy</a>:</p><div class="language-"><pre><code>$ npm i -D @vitejs/plugin-legacy\n</code></pre></div><div class="language-js"><pre><code><span class="token comment">// vite.config.js</span>\n<span class="token keyword">import</span> legacy <span class="token keyword">from</span> <span class="token string">&#39;@vitejs/plugin-legacy&#39;</span>\n<span class="token keyword">import</span> <span class="token punctuation">{</span> defineConfig <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;vite&#39;</span>\n\n<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token function">defineConfig</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n  plugins<span class="token operator">:</span> <span class="token punctuation">[</span>\n    <span class="token function">legacy</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n      targets<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&#39;defaults&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;not IE 11&#39;</span><span class="token punctuation">]</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span>\n  <span class="token punctuation">]</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre></div><p><code>plugins</code> также принимает presets (заготовки), включающие несколько плагинов как один элемент. Это полезно для сложного функционала (такого как интеграция фрэймворка), который реализуется использованием нескольких различных плагинов. Массив будет выровнен (flattened).</p><p>Плагины с Falsy значением будут игнорироваться, что позволяет легко активировать или деактивировать плагины.</p><h2 id="поиск-пnагинов" tabindex="-1">Поиск плагинов <a class="header-anchor" href="#поиск-пnагинов" aria-hidden="true">#</a></h2><div class="tip custom-block"><p class="custom-block-title">Заметка</p><p>Vite стремится предоставить готовую поддержку распространенных шаблонов веб-разработки. Перед поиском Vite или совместимого подключаемого модуля Rollup ознакомьтесь с <a href="./../guide/features.html">Руководство - функционал</a>. Во многих случаях, когда в проекте Rollup потребуется плагин, его уже можно найти в Vite.</p></div><p>Ознакомьтесь с разделом <a href="./../plugins/">Плагины</a> для информации об официальных плагинах. Плагины сообщества перечислены здесь: <a href="https://github.com/vitejs/awesome-vite#plugins" target="_blank" rel="noopener noreferrer">awesome-vite</a>. Чтобы найти совместимые Rollup плагины, смотрите <a href="https://vite-rollup-plugins.patak.dev" target="_blank" rel="noopener noreferrer">Vite Rollup Plugins</a> чтобы увидеть список совместимых официальных Rollup плагинов с инструкциями по использованию или раздел <a href="./../guide/api-plugin.html#rollup-plugin-compatibility">Rollup Plugin Compatibility</a>, если его там нет.</p><p>Вы также можете найти плагины, которые следуют <a href="./api-plugin.html#conventions">рекомендуемым соглашениям (recommended conventions)</a> используя <a href="https://www.npmjs.com/search?q=vite-plugin&amp;ranking=popularity" target="_blank" rel="noopener noreferrer">npm search for vite-plugin</a> для Vite плагинов или <a href="https://www.npmjs.com/search?q=rollup-plugin&amp;ranking=popularity" target="_blank" rel="noopener noreferrer">npm search for rollup-plugin</a> для Rollup плагинов.</p><h2 id="обеспечение-порядка-пnагинов" tabindex="-1">Обеспечение порядка плагинов <a class="header-anchor" href="#обеспечение-порядка-пnагинов" aria-hidden="true">#</a></h2><p>Для совместимости с некоторыми Rollup плагинами может потребоваться принудительно установить их порядок или применить их только во время сборки. Это должна быть деталь реализации плагинов Vite. Вы можете принудительно установить позицию плагина с помощью модификатора <code>enforce</code>:</p><ul><li><code>pre</code>: вызывает плагин до Vite core плагинов</li><li>default: вызывает плагин после Vite core плагинов</li><li><code>post</code>: вызывает плагин после Vite build плагинов</li></ul><div class="language-js"><pre><code><span class="token comment">// vite.config.js</span>\n<span class="token keyword">import</span> image <span class="token keyword">from</span> <span class="token string">&#39;@rollup/plugin-image&#39;</span>\n<span class="token keyword">import</span> <span class="token punctuation">{</span> defineConfig <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;vite&#39;</span>\n\n<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token function">defineConfig</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n  plugins<span class="token operator">:</span> <span class="token punctuation">[</span>\n    <span class="token punctuation">{</span>\n      <span class="token operator">...</span><span class="token function">image</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n      enforce<span class="token operator">:</span> <span class="token string">&#39;pre&#39;</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">]</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre></div><p>Ознакомьтесь с <a href="./api-plugin.html#plugin-ordering">Руководство по API плагинов</a> для более детальной информации, и обратите внимание на метку <code>enforce</code> и пользовательские инструкции для популярных плагинов в <a href="https://vite-rollup-plugins.patak.dev" target="_blank" rel="noopener noreferrer">Vite Rollup Plugins</a> списке совместимости.</p><h2 id="усnовное-приnожение" tabindex="-1">Условное приложение <a class="header-anchor" href="#усnовное-приnожение" aria-hidden="true">#</a></h2><p>По умолчанию плагины вызываются как для сёрвинга файлов (serve), так и для сборки (build). В случаях, когда плагин необходимо условно применять только во время serve или build, используйте свойство <code>apply</code>, чтобы вызывать их только во время <code>build</code> или <code>serve</code>:</p><div class="language-js"><pre><code><span class="token comment">// vite.config.js</span>\n<span class="token keyword">import</span> typescript2 <span class="token keyword">from</span> <span class="token string">&#39;rollup-plugin-typescript2&#39;</span>\n<span class="token keyword">import</span> <span class="token punctuation">{</span> defineConfig <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;vite&#39;</span>\n\n<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token function">defineConfig</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n  plugins<span class="token operator">:</span> <span class="token punctuation">[</span>\n    <span class="token punctuation">{</span>\n      <span class="token operator">...</span><span class="token function">typescript2</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n      apply<span class="token operator">:</span> <span class="token string">&#39;build&#39;</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">]</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre></div><h2 id="создание-пnагинов" tabindex="-1">Создание плагинов <a class="header-anchor" href="#создание-пnагинов" aria-hidden="true">#</a></h2><p>Ознакомьтесь с <a href="./api-plugin.html">Руководством по API плагинов</a> для документации о создании плагинов.</p>',22)];p.render=function(s,e,p,o,l,i){return n(),a("div",null,t)};export{e as __pageData,p as default};