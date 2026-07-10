# 🧠 KSA — Kto Search Agent (React Native + llama.cpp)

Нативное Android-приложение с локальной LLM. Без браузера, без WebGPU, без серверов.

## Что внутри

- **React Native** — интерфейс чата
- **@pocketpalai/react-native-llama** — нативный движок llama.cpp (C++), встроенный в APK
- **DuckDuckGo** — поиск в интернете через Instant Answer API
- **KSA-промпт** — модель сама решает искать ли, формат `%%%запрос%%%`

## Преимущества перед браузерным вариантом

- ✅ Работает на Android 7+ (охват 99% устройств)
- ✅ Прямой доступ к CPU (ARM Neon) и GPU (Vulkan/OpenCL)
- ✅ Полный доступ к ОЗУ телефона — модель не выгружается
- ✅ Нет зависимости от WebGPU и браузерных глюков
- ✅ Скорость выше: Qwen 0.5B ~5-8 токенов/сек (в 2-3 раза быстрее браузера)

## Структура проекта

```
ksa-rn/
├── App.tsx                 # Главный экран + логика поиска
├── babel.config.js         # Настройка path aliases (@/)
├── tsconfig.json
├── setup.sh               # Автоустановка
├── src/
│   ├── components/         # Header, ModelPicker, ChatBubble, ChatInput, SearchIndicator
│   ├── hooks/
│   │   └── useLlama.ts     # Загрузка модели + стриминг
│   ├── lib/
│   │   ├── prompts.ts      # KSA системный промпт
│   │   ├── search.ts       # DuckDuckGo + парсинг
│   │   └── models.ts       # Список моделей GGUF
│   └── types.ts
```

## Сборка APK (пошагово)

### 1. Подготовка окружения (на ПК)

Установи:
- **Node.js 18+** — https://nodejs.org
- **Java JDK 17** — `sudo apt install openjdk-17-jdk` (Linux) или с oracle.com
- **Android Studio** — https://developer.android.com/studio
  - В SDK Manager скачай: Android SDK, Android SDK Platform, Android Virtual Device
  - Установи переменные:
    ```bash
    export ANDROID_HOME=$HOME/Android/Sdk
    export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
    ```

### 2. Автоустановка

```bash
bash setup.sh
```

Скрипт сам создаст проект, добавит зависимости и скопирует исходники.

### 3. Запуск на телефоне

1. Включи **USB-отладку** на телефоне (Настройки → Для разработчиков → USB-отладка)
2. Подключи по USB, выбери «Разрешить отладку»
3. В папке проекта:
   ```bash
   npm run android
   ```
4. APK соберётся и установится автоматически 🎉

### 4. Сборка standalone APK (чтобы раздать)

```bash
cd android
./gradlew assembleRelease
```

APK будет в `android/app/build/outputs/apk/release/app-release.apk`
(Для подписи нужен keystore — см. документацию RN)

## Первый запуск

1. Открой приложение
2. Выбери модель (рекомендую **Qwen 2.5 0.5B** — быстрая)
3. Нажми **Запустить** — модель скачается (~350 МБ) и загрузится
4. Задай вопрос!

## Поиск

Когда спросишь актуальное (погода, новости, подписчики), модель напишет `%%%запрос%%%`. Приложение:
1. Поймает тег
2. Сделает запрос в DuckDuckGo
3. Вернёт результаты модели
4. Модель сформирует ответ по фактам

## Модели

| Модель | Размер | Для кого |
|---|---|---|
| Qwen 2.5 0.5B | ~350 МБ | Быстрая, для слабых телефонов ⭐ |
| Qwen 2.5 1.5B | ~1 ГБ | Золотая середина |
| Gemma 2 2B | ~1.5 ГБ | Качественнее |
| SmolLM 360M | ~250 МБ | Для очень слабых |

## Требования

- Android 7.0+
- 3+ ГБ свободной RAM
- 1-2 ГБ свободного места (под модель)
- Интернет для: скачивания модели и поиска

## Нативные настройки Android (важно)

После `react-native init` и копирования файлов, llama.rn подключается автоматически (autolink). Для максимальной стабильности добавь:

### 1. `android/app/src/main/AndroidManifest.xml` (внутри `<application>`):

```xml
<uses-native-library android:name="libOpenCL.so" android:required="false" />
```

### 2. `android/gradle.properties` (в конец файла):

```properties
# Использовать готовые .so библиотеки (быстрее сборка)
rnllamaBuildFromSource=false
# Для старых телефонов может помочь Vulkan вместо OpenCL (опционально)
# rnllamaPreferredBackend=vulkan
```

### 3. `android/app/build.gradle` — убедись что `minSdk` ≥ 24:

```gradle
android {
    defaultConfig {
        minSdkVersion 24
    }
}
```

> Если сборка падает на этапе NDK — поставь NDK в Android Studio (SDK Manager → NDK).

## ☁️ Сборка APK БЕЗ ПК (GitHub Actions)

Тебе не нужен компьютер — APK соберётся на серверах GitHub. Нужен только аккаунт на github.com (бесплатный).

### Шаг 1. Создай репозиторий
1. Зайди на https://github.com (с телефона в браузере)
2. Жми **+** → **New repository**
3. Имя: `ksa` → **Create repository**

### Шаг 2. Залей код
Самый простой способ с телефона — через **GitHub Mobile** (приложение) или веб:
- В приложении GitHub нажми **+** → **Create gist / repository**
- Либо с компьютера друга / браузера загрузи папку `ksa-rn` (все файлы, кроме `node_modules`)

Или (если умеешь git):
```bash
cd ksa-rn
git init && git add . && git commit -m "init"
git remote add origin https://github.com/ТВОЙ_ЛОГИН/ksa.git
git push -u origin main
```

### Шаг 3. Запусти сборку
1. В репозитории открой вкладку **Actions**
2. Увидишь workflow **Build KSA APK** → жми **Run workflow**
3. Жди 10-20 минут (первая сборка долгая)

### Шаг 4. Скачай APK
1. Когда сборка завершится — открой её в Actions
2. Внизу блок **ksa-app-release** (или **app-debug**) → скачай `app-debug.apk`
3. Перенеси на телефон и установи (разреши «установку из неизвестных источников»)

Готово — у тебя KSA на телефоне! 🎉

> Примечание: собранный APK — debug-версия (авто-подписанный). Для публикации в стор нужен keystore (описано в документации RN).
