# HMR API

:::tip Заметка
Это клиентский HMR API. Для обработки HMR обновлений в плагинах, смотрите [handleHotUpdate](./api-plugin#handlehotupdate).

Руководство HMR API в первую очередь предназначено для авторов фреймворков и инструментов. Как конечный пользователь, вы скорее всего будете работать с уже настроенным для вас HMR в специальном (starter template) стартовом шаблоне с использованием нужного фреймворка
:::

Vite предоставляет свой ручной HMR API через специальный объект `import.meta.hot`:

```ts
interface ImportMeta {
  readonly hot?: {
    readonly data: any

    accept(): void
    accept(cb: (mod: any) => void): void
    accept(dep: string, cb: (mod: any) => void): void
    accept(deps: string[], cb: (mods: any[]) => void): void

    dispose(cb: (data: any) => void): void
    decline(): void
    invalidate(): void

    on(event: string, cb: (...args: any[]) => void): void
  }
}
```

## Обязательные Conditional Guard

Прежде всего, убедитесь что вы позаботились обо всех использованиях HMR API и добавили условные блоки, чтобы код мог делать tree-shaken в production:

```js
if (import.meta.hot) {
  // HMR code
}
```

## `hot.accept(cb)`

Чтобы модуль самопринялся (self-accept), используйте `import.meta.hot.accept` с callback'ом, который принимает обновлённый модуль:

```js
export const count = 1

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    console.log('updated: count is now ', newModule.count)
  })
}
```

Модуль, который принимает "accepts" hot обновления считается **HMR boundary**.

Заметьте, что Vite's HMR на самом деле не меняет оригинальный импортированный модуль: если HMR boundary модуль реэкспортирует импорты из зависимости, то он отвечает за обновление этих реэкспортов (и эти экспорты должны использовать `let`). В дополнение, импортеры не будут уведомлены об изменениях вверх по цепочки от boundary module.

Это упрощённая реализация HMR - достаточна для большинства случаев разработки, и в то же время позволяет нам опустить дорогостоящую работу по созданию proxy модулей.

## `hot.accept(deps, cb)`

Модуль также может принимать обновления напрямую из зависимостей, без своей перезагрузки:

```js
import { foo } from './foo.js'

foo()

if (import.meta.hot) {
  import.meta.hot.accept('./foo.js', (newFoo) => {
    // the callback принимает обновлённый './foo.js' модуль
    newFoo.foo()
  })

  // Также может принимать массив зависимых модулей:
  import.meta.hot.accept(
    ['./foo.js', './bar.js'],
    ([newFooModule, newBarModule]) => {
      // the callback принимает обновлённые модули в массиве
    }
  )
}
```

## `hot.dispose(cb)`

Самостоятельно принимающий модуль или модуль, который должен приняться другими может использовать `hot.dispose`, чтобы почистить любые стойкие побочные эффекты "side effects" созданные его обновлённой копией:

```js
function setupSideEffect() {}

setupSideEffect()

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    // cleanup side effect
  })
}
```

## `hot.data`

`import.meta.hot.data` объект сохраняется в разных экземплярах одного и того же обновлённого модуля. Его можно использовать, чтобы передать информацию из предыдущей версии модуля в следующую.

## `hot.decline()`

Вызов `import.meta.hot.decline()` означает, что модуль не hot-updatable, и браузер должен выполнить полную перезагрузку если этот модуль встречается во время всплытия HMR изменений.

## `hot.invalidate()`

Сейчас, вызов `import.meta.hot.invalidate()` просто перезагрузит страницу.

## `hot.on(event, cb)`

Слушать HMR событие.

Следующие HMR события Vite отправляет (dispatched) автоматически:

- `'vite:beforeUpdate'` прямо перед тем, когда будет применено обновление (например, модуль будет заменен)
- `'vite:beforeFullReload'` перед тем, когда случится полная перезагрузка
- `'vite:beforePrune'` перед тем, когда модуль, который больше не нужен очиститься
- `'vite:error'` когда происходит ошибка (error) (например, syntax error)

Кастомные HMR события также могут быть отправлены из плагинов. Смотрите [handleHotUpdate](./api-plugin#handlehotupdate) для большей информации.
