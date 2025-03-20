# TipTap Variable Editor

A modern React application that provides a rich text editor with variable insertion capabilities using TipTap.

## Features

- Rich text editing with TipTap
- Variable insertion and management
- Modern UI with gradient styling
- Responsive design

## Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher) or yarn (v1.22.0 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sailesh3000/tiptap-variable-editor.git
   cd tiptap-variable-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Install required packages:
   ```bash
   npm install
   ```

## Setting Up TailwindCSS

1. Initialize Tailwind CSS:
   ```bash
   npx tailwindcss init -p
   ```

2. Update the `tailwind.config.js` file:
   ```javascript
   module.exports = {
     content: [
       "./src/**/*.{js,jsx,ts,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

3. Add Tailwind directives to your CSS file (src/index.css):
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Customization

- Add more variables to the `variables` state in the `VariableEditor` component
- Customize the styling in `App.css`
- Extend TipTap editor functionality by adding more extensions
