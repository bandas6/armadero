import { Routes } from '@angular/router';
import { adminRoleGuard } from '../../core/guards/admin.guard';

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
        path: 'colecciones',
        loadComponent: () =>
          import('./admin-collection-list').then((m) => m.AdminCollectionList),
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
        path: 'cuenta',
        loadComponent: () => import('./admin-account').then((m) => m.AdminAccount),
      },
      // --- Solo ADMIN (el API también lo exige) ---
      {
        path: 'ajustes',
        canActivate: [adminRoleGuard],
        loadComponent: () => import('./admin-settings-form').then((m) => m.AdminSettingsForm),
      },
      {
        path: 'banners',
        canActivate: [adminRoleGuard],
        loadComponent: () => import('./admin-banner-list').then((m) => m.AdminBannerList),
      },
      {
        path: 'envios',
        canActivate: [adminRoleGuard],
        loadComponent: () => import('./admin-shipping-list').then((m) => m.AdminShippingList),
      },
      {
        path: 'usuarios',
        canActivate: [adminRoleGuard],
        loadComponent: () => import('./admin-user-list').then((m) => m.AdminUserList),
      },
    ],
  },
];
