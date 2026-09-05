import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./admin-product-list').then((m) => m.AdminProductList),
      },
      {
        path: 'productos/nuevo',
        loadComponent: () => import('./admin-product-form').then((m) => m.AdminProductForm),
      },
      {
        path: 'productos/:id',
        loadComponent: () => import('./admin-product-form').then((m) => m.AdminProductForm),
      },
      {
        path: 'categorias',
        loadComponent: () => import('./admin-category-list').then((m) => m.AdminCategoryList),
      },
      {
        path: 'cotizaciones',
        loadComponent: () => import('./admin-quote-list').then((m) => m.AdminQuoteList),
      },
      {
        path: 'cotizaciones/:id',
        loadComponent: () => import('./admin-quote-detail').then((m) => m.AdminQuoteDetail),
      },
      {
        path: 'ajustes',
        loadComponent: () => import('./admin-settings-form').then((m) => m.AdminSettingsForm),
      },
    ],
  },
];
