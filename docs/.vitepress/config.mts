import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'vue-desktop',
  description: 'A Vue 3 desktop-style window manager',
  base: '/vue-desktop/',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/vue-desktop/logo.svg' }]
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/desktop-instance' },
      { text: 'Plugins', link: '/plugins/overview' },
      { text: 'Demo', link: '/demo/', target: '_blank' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Core Concepts', link: '/guide/core-concepts' },
            { text: 'Window Definition', link: '/guide/window-definition' }
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Window Management', link: '/guide/window-management' },
            { text: 'Keyboard Shortcuts', link: '/guide/keyboard-shortcuts' },
            { text: 'Styling', link: '/guide/styling' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Creating Plugins', link: '/guide/creating-plugins' },
            { text: 'TypeScript', link: '/guide/typescript' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'Core API',
          items: [
            { text: 'DesktopInstance', link: '/api/desktop-instance' },
            { text: 'Components', link: '/api/components' },
            { text: 'Types', link: '/api/types' },
            { text: 'Events', link: '/api/events' }
          ]
        }
      ],
      '/plugins/': [
        {
          text: 'Plugins',
          items: [
            { text: 'Overview', link: '/plugins/overview' },
            { text: 'Taskbar', link: '/plugins/taskbar' },
            { text: 'Shortcuts', link: '/plugins/shortcuts' },
            { text: 'Snap', link: '/plugins/snap' },
            { text: 'Persistence', link: '/plugins/persistence' },
            { text: 'Start Menu', link: '/plugins/start-menu' },
            { text: 'Spotlight', link: '/plugins/spotlight' },
            { text: 'Context Menu', link: '/plugins/context-menu' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/anthropics/vue-desktop' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present'
    },

    search: {
      provider: 'local'
    }
  }
})
