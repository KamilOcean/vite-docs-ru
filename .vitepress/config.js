// @ts-check

/**
 * @type {import('vitepress').UserConfig}
 */
module.exports = {
  title: 'Vite',
  description: 'Frontend инструмент нового поколения',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]],
  themeConfig: {
    repo: 'vitejs/vite',
    logo: '/logo.svg',
    docsDir: 'docs',
    docsBranch: 'main',
    editLinks: true,
    editLinkText: 'Предложить правки для этой страницы',

    algolia: {
      apiKey: 'b573aa848fd57fb47d693b531297403c',
      indexName: 'vitejs',
      searchParameters: {
        facetFilters: ['tags:en']
      }
    },

    carbonAds: {
      carbon: 'CEBIEK3N',
      placement: 'vitejsdev'
    },

    nav: [
      { text: 'Руководство', link: '/guide/' },
      { text: 'Конфигурация', link: '/config/' },
      { text: 'Плагины', link: '/plugins/' },
      {
        text: 'Ссылки',
        items: [
          {
            text: 'Twitter',
            link: 'https://twitter.com/vite_js'
          },
          {
            text: 'Discord Chat',
            link: 'https://chat.vitejs.dev'
          },
          {
            text: 'Awesome Vite',
            link: 'https://github.com/vitejs/awesome-vite'
          },
          {
            text: 'DEV Community',
            link: 'https://dev.to/t/vite'
          },
          {
            text: 'Rollup Plugins Compat',
            link: 'https://vite-rollup-plugins.patak.dev/'
          },
          {
            text: 'Changelog',
            link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md'
          }
        ]
      },
      {
        text: 'Языки',
        items: [
          {
            text: 'English',
            link: 'https://vitejs.dev'
          },
          {
            text: '简体中文',
            link: 'https://cn.vitejs.dev'
          },
          {
            text: '日本語',
            link: 'https://ja.vitejs.dev'
          }
        ]
      }
    ],

    sidebar: {
      '/config/': 'auto',
      '/plugins': 'auto',
      // catch-all fallback
      '/': [
        {
          text: 'Руководство',
          children: [
            {
              text: 'Почему Vite',
              link: '/guide/why'
            },
            {
              text: 'Начало работы',
              link: '/guide/'
            },
            {
              text: 'Функционал',
              link: '/guide/features'
            },
            {
              text: 'Использование плагинов',
              link: '/guide/using-plugins'
            },
            {
              text: 'Pre-Bundling зависимостей',
              link: '/guide/dep-pre-bundling'
            },
            {
              text: 'Обработка статичных ресурсов',
              link: '/guide/assets'
            },
            {
              text: 'Сборка для Production',
              link: '/guide/build'
            },
            {
              text: 'Деплой статичного сайта',
              link: '/guide/static-deploy'
            },
            {
              text: 'Env переменные и Modes',
              link: '/guide/env-and-mode'
            },
            {
              text: 'Server-Side Rendering (SSR)',
              link: '/guide/ssr'
            },
            {
              text: 'Backend интеграция',
              link: '/guide/backend-integration'
            },
            {
              text: 'Сравнение',
              link: '/guide/comparisons'
            },
            {
              text: 'Миграция с v1',
              link: '/guide/migration'
            }
          ]
        },
        {
          text: 'APIs',
          children: [
            {
              text: 'Plugin API',
              link: '/guide/api-plugin'
            },
            {
              text: 'HMR API',
              link: '/guide/api-hmr'
            },
            {
              text: 'JavaScript API',
              link: '/guide/api-javascript'
            },
            {
              text: 'Config Reference',
              link: '/config/'
            }
          ]
        }
      ]
    }
  }
}
