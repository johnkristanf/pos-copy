# How to Create a New Page in Laravel with Inertia and Wayfinder

This guide outlines the standard process for creating a new page, which involves creating a controller, defining routes, registering the page component, and generating typed routes with Wayfinder.

---

## Process

### 1. Create and Structure the Controller

Use the Artisan `make:controller` command, specifying the module directory (e.g., `Returns`). This automatically handles the correct folder structure and namespace.

* **Example:** Create a `ReturnToCustomerController` under the `Returns` module.
* **Command:**
    ```bash
    php artisan make:controller Returns/ReturnToCustomerController
    ```
* This creates the file at: `app/Http/Controllers/Returns/ReturnToCustomerController.php`
* It also correctly sets the namespace to: `namespace App\Http\Controllers\Returns;`

---

### 2. Add the Render Method

Inside the new controller, add a method to render your Inertia page. We use a `render...Page` naming convention for clarity.

* **Example Boilerplate (`ReturnFromCustomerController.php`):**
    ```php
    <?php
    
    namespace App\Http\Controllers\Returns;
    
    use App\Http\Controllers\Controller;
    use Inertia\Inertia;
    
    class ReturnFromCustomerController extends Controller
    {
        /**
         * Renders the "Return From Customer" page.
         */
        public function renderReturnFromCustomerPage()
        {
            // This path maps to: resources/js/Pages/return/from-customer.vue (or .tsx)
            return Inertia::render('return/from-customer');
        }
    }
    ```

---

### 3. Create a Module-Specific Routes File

Create a new PHP file for your module's routes (e.g., `routes/returns.php`). Define the route for your new controller method here.

* **Example (`routes/returns.php`):**
    ```php
    <?php
    
    use App\Http\Controllers\Returns\ReturnFromCustomerController;
    use App\Http\Controllers\Returns\ReturnToSupplierController;
    use Illuminate\Support\Facades\Route;
    
    Route::middleware(['auth', 'verified'])->group(function () {
        // RETURNS FROM CUSTOMERS
        Route::get('return/from-customer', [ReturnFromCustomerController::class, 'renderReturnFromCustomerPage'])
            ->name('return.renderReturnFromCustomerPage');
    
        Route::get('return/to-supplier', [ReturnToSupplierController::class, 'renderReturnToSupplierPage'])
            ->name('return.renderReturnToSupplierPage');
    });
    
    ```

---

### 4. Register the Module Routes in `web.php`

Require your new module routes file (e.g., `returns.php`) inside the main `routes/web.php` file.

* **Example (`routes/web.php`):**
    ```php
    <?php
    
    use Illuminate\Support\Facades\Route;
    use Inertia\Inertia;
    
    Route::get('/', fn () => redirect()->route('login'))->name('home');
    
    Route::get('/csrf-token', fn () => response()->json(['token' => csrf_token()]));
    
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');
    });
    
    require __DIR__.'/integration.php';
    require __DIR__.'/management.php';
    require __DIR__.'/returns.php'; // <-- ADD YOUR NEW FILE HERE
    require __DIR__.'/settings.php';
    require __DIR__.'/users.php';
    require __DIR__.'/auth.php';
    
    Route::fallback(fn () => Inertia::render('error', [
        'status' => 404,
        'title' => 'Page Not Found',
        'description' => 'The page you\'re looking for doesn\'t exist or has been moved.',
        'isDev' => config('app.debug'),
        'error' => null,
    ])->toResponse(request())->setStatusCode(404));
    
    ```

---

### 5. Create the Frontend Page Component

Create the corresponding frontend page component (e.g., Vue or React). The path **must match** the string used in the controller's `Inertia::render()` call.

* **Example:**
    Based on `Inertia::render('return/from-customer')`, create the file at:
    `resources/js/Pages/return/from-customer.vue` (or `.tsx`, etc.)

---

### 6. Clear Route Cache

Run `route:clear` to ensure Laravel recognizes the new routes.

```bash
php artisan route:clear
```

---

### 7. Generate Wayfinder Routes

Run the `Wayfinder` command to generate the typed route helper file.

```bash
php artisan wayfinder:generate
```

---

### 8. [Optional] Add to Frontend Route Helper

To make the new route easily accessible in your frontend, add it to your `page-route.ts` (or equivalent) helper file.

Ex. `page-route.ts`

```Typescript
import AuthenticationController from "@/actions/App/Http/Controllers/Auth/AuthenticationController"
import ApiKeyController from "@/actions/App/Http/Controllers/Integration/ApiKeyController"
import ProjectsController from "@/actions/App/Http/Controllers/Integration/ProjectsController"
import CustomersController from "@/actions/App/Http/Controllers/Management/CustomersController"
import ItemsController from "@/actions/App/Http/Controllers/Management/ItemsController"
// Import the new controller
import ReturnFromCustomerController from "@/actions/App/Http/Controllers/Returns/ReturnFromCustomerController"
import ReturnToSupplierController from "@/actions/App/Http/Controllers/Returns/ReturnToSupplierController"
import UsersController from "@/actions/App/Http/Controllers/Users/UsersController"
import { dashboard } from "@/routes"

export const PAGE_ROUTES = {
  LOGIN_PAGE: AuthenticationController.renderLoginPage.url(),
  FORGOT_PASSWORD_PAGE: AuthenticationController.renderForgotPasswordPage.url(),
  RESET_PASSWORD_PAGE: (token: string | number) =>
    AuthenticationController.renderResetPasswordPage.url(token),
  DASHBOARD_PAGE: dashboard.url(),
  INTEGRATION_PROJECTS_PAGE: ProjectsController.renderProjectsPage.url(),
  ME_PAGE: UsersController.renderMePage.url(),
  USER_PAGE: UsersController.renderUserPage.url(),
  USERS_PAGE: UsersController.renderUsersPage.url(),
  CUSTOMERS_PAGE: CustomersController.renderCustomersPage.url(),
  ITEMS_PAGE: ItemsController.renderItemsPage.url(),
  INTEGRATION_API_KEYS_PAGE: (
    slug: string | number,
    project: string | { id: string },
  ) => ApiKeyController.renderApiKeyPage.url({ slug, project }),

  // Add the new routes
  RETURN_FROM_CUSTOMER_PAGE: ReturnFromCustomerController.renderReturnFromCustomerPage.url(),
  RETURN_TO_SUPPLIER_PAGE: ReturnToSupplierController.renderReturnToSupplierPage.url(),
}
```

---

### 9. [Optional] Use the Route in Components

You can now use this constant in your frontend components, like a `sidebar`, to link to the new page.

```Typescript
{
  groupLabel: "Returns",
  menus: [
    {
      href: PAGE_ROUTES.RETURN_FROM_CUSTOMER_PAGE,
      label: "From Customer",
      active: pathname === PAGE_ROUTES.RETURN_FROM_CUSTOMER_PAGE,
      icon: ArrowDownToDot,
      submenus: [],
    },
    {
      href: PAGE_ROUTES.RETURN_TO_SUPPLIER_PAGE,
      label: "To Supplier",
      active: pathname === PAGE_ROUTES.RETURN_TO_SUPPLIER_PAGE,
      icon: ArrowUpFromDot,
      submenus: [],
    },
  ],
},
```

---

### 10. (Legacy) Alternative web.php Structure

This is an example of an alternative `web.php` structure for reference.

``` php
<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => redirect()->route('login'))->name('home');

Route::get('/csrf-token', fn () => response()->json(['token' => csrf_token()]));

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');
});

require __DIR__.'/integration.php';
require __DIR__.'/management.php';
require __DIR__.'/returns.php';
require __DIR__.'/settings.php';
require __DIR__.'/users.php';
require __DIR__.'/auth.php';

Route::fallback(fn () => Inertia::render('error', [
    'status' => 404,
    'title' => 'Page Not Found',
    'description' => 'The page you\'re looking for doesn\'t exist or has been moved.',
    'isDev' => config('app.debug'),
    'error' => null,
])->toResponse(request())->setStatusCode(404));


