# Fever Recipes 🍳

A modern, elegant recipe catalog application built with Angular, featuring a premium "sticker" aesthetic with custom illustrations and a soft color palette.

## 🚀 Main Features

- **Recipe Catalog**: Browse recipes with optimized pagination and smooth navigation
- **Advanced Filtering**:
  - **Search by name**: Real-time search with debounce optimization
  - **Category filters**: Visual category selection with custom hand-drawn icons (Dessert, Fish, Meat, Legumes, Rice, Vegetables, Doughs, Pasta, Others)
- **Recipe Details**: Comprehensive recipe information including ingredients, step-by-step instructions, prep time, and nutritional data
- **Recipe of the Day**: Daily featured recipe with elegant presentation
- **Add New Recipes**: Premium modal interface with step-by-step instruction builder
- **Internationalization (i18n)**: Seamless switching between English and Spanish

## 🎨 Design Highlights

- **Premium Aesthetic**: Soft cream and pink color palette (#f5f0e6, #fef3f3, #d78b8e)
- **Custom Category Icons**: Hand-drawn style illustrations with rich, dark circular backgrounds
- **Floating Action Button**: Wavy "sticker" design with rotating circular text animation
- **Step-by-Step Instructions**: Dynamic form with automatic step addition
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🛠️ Technology Stack

- **Framework**: Angular 20 (Standalone Components)
- **Reactivity**: Angular Signals for efficient state management
- **Styling**: SCSS with custom design system
- **Backend**: JSON Server for API simulation
- **Testing**: Jasmine & Karma with Stryker mutation testing
- **Internationalization**: ngx-translate

## ⭐ Technical Highlights

- **Signal-based Architecture**: Reactive data flow using Angular Signals
- **Smart Caching**: Pagination service with intelligent cache management
- **Automatic Refresh**: Recipe list updates automatically when new recipes are created
- **Mutation Testing**: Stryker integration for test quality verification
- **Recipe of the Day Algorithm**: Deterministic daily selection based on date seed

## ⚙️ Installation & Running the Project

1. **Clone the repository**

2. **Install dependencies**
```bash
npm install
```

3. **Start the API server**
```bash
npm run start:api
```

4. **Run the development server**
```bash
ng serve
```

5. **Run tests**
```bash
ng test
```

6. **Run mutation tests with Stryker**
```bash
npm run test:stryker
```

## 📁 Project Structure

- `/src/app/core` - Core services, models, and constants
- `/src/app/features` - Feature modules (recipe-list, recipe-detail)
- `/src/app/shared` - Shared components (filters, cards, modals)
- `/public/assets` - Static assets including custom category icons

## 🌐 Available Scripts

- `npm start` - Start development server
- `npm run start:api` - Start JSON Server API
- `npm test` - Run unit tests
- `npm run test:stryker` - Run mutation testing
- `npm run build` - Build for production
