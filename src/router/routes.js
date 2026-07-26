import LoginPage from "src/layouts/LoginPage.vue";
import RegisterPage from "src/layouts/Register.vue";
import { requireAuth } from "./guards";

const routes = [
  { 
    path: "/", component: LoginPage,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          if (decoded.exp * 1000 > Date.now()) {
            next("/dashboardsantri");
          } else {
            localStorage.removeItem("token");
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next();
        }
      } else {
        next();
      }
    } 
  },
  {
    path: "/forgot", component: () => import('layouts/ForgotPassword.vue')
  },
  {
    path: "/register", component: RegisterPage
  },
  {
    path: '/dashboardadmin',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/AdminHomePage.vue') }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/dashboardsantri',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/SantriHomePage.vue') }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/dashboardguru',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/GuruHomePage.vue') }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/module/:id?',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'module-detail',
        component: () => import('pages/ModulePage.vue')
      }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/module-form/:id?',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'module-form',
        component: () => import('pages/ModulesForm.vue')
      }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/lesson',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: ':id', 
        name: 'lesson-detail',
        component: () => import('pages/LessonPage.vue')
      }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/lesson-form/:id?',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'lesson-form',
        component: () => import('pages/LessonForm.vue')
      }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/quiz-form/:id?',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'quiz-form',
        component: () => import('pages/QuizForm.vue')
      }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/quiz-answer/:id?/:idsantri?',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'quiz-answer',
        component: () => import('pages/QuizAnswerPage.vue')
      }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/guru-quiz-answer/:idquiz/:idsantri',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'guru-quiz-answer',
        component: () => import('pages/GuruQuizAnswerPage.vue')
      }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/guru-inbox',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/GuruInboxPage.vue') }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/santri-inbox',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/SantriInboxPage.vue') }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/user-form/:id?',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'user-form',
        component: () => import('pages/UserForm.vue')
      }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/users',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/UsersPage.vue')
      }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/tajwid',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/TajwidPage.vue') }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/tajwid-form/:id?',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'tajwid-form',
        component: () => import('pages/TajwidForm.vue')
      }
    ],
    beforeEnter: requireAuth
  },
  {
    path: '/donasi',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DonationsPage.vue') }
    ],
    beforeEnter: requireAuth
  },
  { 
    path: '/profile',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/ProfilePage.vue') }
    ],
    beforeEnter: requireAuth
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
