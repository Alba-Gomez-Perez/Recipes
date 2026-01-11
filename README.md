# Frontend Code Challenge
# Fever Pets 🐾

Fever's Code Challenge for Front End job applicants
Welcome to **Fever Pets**. This project is a Single Page Application (SPA) built with Angular, allowing users to explore a pets catalog, filter them by various criteria, and view detailed information about their health and characteristics

## 🚀 Main features

*   **List pets view**: Display of pets with optimized pagination.
*   **Filters**:
    *   **Searching by name**: Implementada con *debounce* para optimizar las llamadas a la API.
    *   **Type**: Filtering based on pet type (Dog or cat).
    *   **Physical attributes**: Filter by weight, height and length.
*   **Sorting**: Sorting by name and physical attributes.
*   **Pet detail view**: All information of the pet.
*   **Health section**: Show health status (❤️, 💛, 💚).
*   **Favourite pet**: Pet of the day.


## 🛠️ Technology Stack

*   **Framework**: Angular 20 (Standalone Components).
*   **Reactivity**: Angular Signals.
*   **Style**: SCSS.
*   **Testing**: Jasmine & Karma.

## ⭐ Highlights

*   **Stryker**: A [tool](https://stryker-mutator.io/) that helps verify the quality of tests by making small changes to the code and checking if the tests catch them.
*   **Cache**: Angular's caching mechanism for HTTP requests.
*   **Pagination**: Optimized pagination for better performance.
*   **Pet of the day**: Generated a pet of the day using a random number based on the current date.
*   **Internacionalización (i18n)**: Switch between English and Spanish.


[![Watch the demo] (https://www.loom.com/share/7437f8f800b2465b89a0ffb5b1122fdc)


## ⚙️ Installation & Running the Project

1. **Clone the repository**
2. **Install dependencies**

```bash
npm install
```

3. **Run the project**

```bash
ng serve
```

4. **Run the tests**

```bash
ng test
```

5. **Run Stryker**
```bash
npm run test:stryker
```

