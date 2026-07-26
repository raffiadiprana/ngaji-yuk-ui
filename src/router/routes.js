import LoginPage from "src/layouts/LoginPage.vue";
import RegisterPage from "src/layouts/Register.vue";
import { jwtDecode } from "jwt-decode";

const routes = [
  { 
    path: "/", component: LoginPage,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            next("/dashboardsantri"); // Jika sudah login, redirect ke dashboard
          } else {
            localStorage.removeItem("token");
            next(); // Token kadaluarsa, tetap di halaman login
          }
        } catch (error) {
          localStorage.removeItem("token");
          next(); // Token tidak valid, tetap di halaman login
        }
      } else {
        next(); // Tidak ada token, biarkan masuk ke halaman login
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
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); // Remove expired token
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },
  {
    path: '/dashboardsantri',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/SantriHomePage.vue') }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); // Remove expired token
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },
  {
    path: '/dashboardguru',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/GuruHomePage.vue') }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); // Remove expired token
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
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
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },
  {
    path: '/module-form/:id?',   // id opsional, kalau gak ada berarti tambah baru
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',   // path kosong karena sudah pakai param di parent
        name: 'module-form',
        component: () => import('pages/ModulesForm.vue')  // sesuaikan path komponen form kamu
      }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
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
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); // Remove expired token
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },
  {
    path: '/lesson-form/:id?',   // id opsional, kalau gak ada berarti tambah baru
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',   // path kosong karena sudah pakai param di parent
        name: 'lesson-form',
        component: () => import('pages/LessonForm.vue')  // sesuaikan path komponen form kamu
      }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },
  {
    path: '/quiz-form/:id?',   // id opsional, kalau gak ada berarti tambah baru
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',   // path kosong karena sudah pakai param di parent
        name: 'quiz-form',
        component: () => import('pages/QuizForm.vue')  // sesuaikan path komponen form kamu
      }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
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
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); // Remove expired token
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
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
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); // Remove expired token
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },
  {
    path: '/guru-inbox',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/GuruInboxPage.vue') }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); // Remove expired token
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },
  {
    path: '/santri-inbox',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/SantriInboxPage.vue') }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); // Remove expired token
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },
  {
    path: '/user-form/:id?',   // id opsional, kalau gak ada berarti tambah baru
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',   // path kosong karena sudah pakai param di parent
        name: 'user-form',
        component: () => import('pages/UserForm.vue')  // sesuaikan path komponen form kamu
      }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },
  {
    path: '/users',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/UsersPage.vue')
      }
    ]
  },
  {
    path: '/tajwid',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/TajwidPage.vue') }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); // Remove expired token
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },
  {
    path: '/tajwid-form/:id?',   // id opsional, kalau gak ada berarti tambah baru
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',   // path kosong karena sudah pakai param di parent
        name: 'tajwid-form',
        component: () => import('pages/TajwidForm.vue')  // sesuaikan path komponen form kamu
      }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },
  {
    path: '/donasi',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DonationsPage.vue') }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); // Remove expired token
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },
  
  {
    path: '/profile',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/ProfilePage.vue') }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); // Remove expired token
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
