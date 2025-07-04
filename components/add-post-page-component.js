import { renderHeaderComponent } from './header-component.js'
import { renderUploadImageComponent } from './upload-image-component.js'

export function renderAddPostPageComponent({ appEl, user, onAddPostClick }) {
    let imageUrl = ''
    let description = ''
    let error = null

    const render = () => {
        const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <h2>Добавить пост</h2>
        ${error ? `<div class="error">${error}</div>` : ''}
        <div class="upload-image-container"></div>
        <input
          type="text"
          id="description-input"
          placeholder="Опишите фото"
          class="description-input"
          value="${description}"
        />
        <button class="button" id="add-button">Добавить</button>
      </div>
    `

        appEl.innerHTML = appHtml
        renderHeaderComponent({
            element: document.querySelector('.header-container'),
            user,
        })

        // Рендер компонента загрузки изображения
        renderUploadImageComponent({
            element: document.querySelector('.upload-image-container'),
            onImageUrlChange(newImageUrl) {
                imageUrl = newImageUrl
                error = null // Сбрасываем ошибку при изменении изображения
                render() // Перерендериваем форму
            },
        })

        // Обработчик изменения текста описания
        document
            .getElementById('description-input')
            .addEventListener('input', (e) => {
                description = e.target.value
                error = null // Сбрасываем ошибку при изменении текста
            })

        // Обработчик кнопки добавления поста
        document.getElementById('add-button').addEventListener('click', () => {
            // Проверка авторизации пользователя
            if (!user) {
                error = 'Для добавления поста необходимо авторизоваться'
                render()
                return
            }

            description = document
                .getElementById('description-input')
                .value.trim()

            // Валидация формы
            if (!description) {
                error = 'Введите описание'
                render()
                return
            }

            if (!imageUrl) {
                error = 'Не выбрана фотография'
                render()
                return
            }

            // Блокировка кнопки во время отправки
            const addButton = document.getElementById('add-button')
            addButton.disabled = true
            addButton.textContent = 'Добавление...'

            // Отправка поста на сервер
            onAddPostClick({
                description,
                imageUrl,
            })
                .catch((error) => {
                    console.error('Ошибка добавления поста:', error)
                    // Показываем пользователю ошибку
                    if (error.message === 'Неверные данные поста') {
                        error = 'Ошибка: некорректные данные поста'
                    } else {
                        error = 'Ошибка при добавлении поста. Попробуйте позже.'
                    }
                    render()
                })
                .finally(() => {
                    // Разблокируем кнопку в любом случае
                    addButton.disabled = false
                    addButton.textContent = 'Добавить'
                })
        })
    }

    render()
}
