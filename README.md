# gulp-scss

## Установка

- установите [Yarn](https://yarnpkg.com/en/docs/install)
- скачайте сборку с помощью [Git](https://git-scm.com/downloads)
- установите ```gulp``` глобально: ```yarn global add gulp-cli```
- перейдите в скачанную папку со сборкой: ```cd gulp-scss```
- скачайте необходимые зависимости: ```yarn```
- чтобы начать работу, введите команду: ```gulp``` (режим разработки)
- чтобы перейти в режим сборки, установите переменную окружения node.js введя команду  ```$env:STATUS='production'```

Если вы всё сделали правильно, у вас должен открыться браузер с локальным сервером.
Режим сборки предполагает оптимизацию проекта: минифицирование CSS и JS-файлов для загрузки на сервер.

## Файловая структура

```
gulp-scss-starter
├── public
│   ├── img
│   ├── fonts
├── src
│   ├── fonts
│   ├── img
│   ├── js
│   ├── pages
│   └── styles
├── gulpfile.js
├── package.json
└── .gitignore
```

- Корень папки:
  - ```gulpfile.js``` — настройки Gulp
  - ```package.json``` — список зависимостей
  - ```.gitignore``` – запрет на отслеживание файлов Git'ом
- Папка ```src``` - используется во время разработки:
  - шрифты: ```src/fonts```
  - изображения: ```src/img```
  - JS-файлы: ```src/js```
  - страницы сайта: ```src/pages```
  - SCSS-файлы: ```src/styles```
- Папка ```public``` - папка, из которой запускается локальный сервер для разработки (при запуске ```gulp```)