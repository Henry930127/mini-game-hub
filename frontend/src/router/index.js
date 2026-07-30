import { createRouter, createWebHistory } from "vue-router"

import Home from "../views/Home.vue"
import Game from "../views/Game.vue"
import GameDetail from "../views/GameDetail.vue"
import Leaderboard from "../views/Leaderboard.vue"
import Login from "../views/Login.vue"
import Register from "../views/Register.vue"
import Profile from "../views/Profile.vue"
import AdminLogin from "../views/AdminLogin.vue"
import AdminDashboard from "../views/AdminDashboard.vue"

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/game",
    name: "Game",
    component: Game
  },
  {
    path: "/games/:slug",
    name: "GameDetail",
    component: GameDetail
  },
  {
    path: "/leaderboard",
    name: "Leaderboard",
    component: Leaderboard
  },
  {
    path: "/login",
    name: "Login",
    component: Login
  },
  {
    path: "/register",
    name: "Register",
    component: Register
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/admin/login",
    name: "admin-login",
    component: AdminLogin
  },
  {
    path: "/admin",
    name: "admin-dashboard",
    component: AdminDashboard,
    meta: {
      requiresAdmin: true
    }
  },
  {
    path: "/admin/users",
    name: "admin-users",
    component: () => import("../views/admin/AdminUsers.vue"),
    meta: {
      requiresAdmin: true
    }
  },
  {
    path: "/admin/scores",
    name: "admin-scores",
    component: () => import("../views/admin/AdminScores.vue"),
    meta: {
      requiresAdmin: true
    }
  },
  {
    path: "/admin/games",
    name: "admin-games",
    component: () => import("../views/admin/AdminGames.vue"),
    meta: {
      requiresAdmin: true
    }
  },
  {
    path: "/admin/announcements",
    name: "admin-announcements",
    component: () => import("../views/admin/AdminAnnouncements.vue"),
    meta: {
      requiresAdmin: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")
  const savedAdminUser = localStorage.getItem("adminUser")
  let isAdmin = false

  if (token && savedAdminUser) {
    try {
      const adminUser = JSON.parse(savedAdminUser)
      isAdmin = adminUser?.role === "admin"
    } catch {
      isAdmin = false
    }
  }

  if (savedAdminUser && !isAdmin) {
    localStorage.removeItem("adminUser")
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)

  if (requiresAuth && !token) {
    next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    return
  }

  if (requiresAdmin && !isAdmin) {
    next("/admin/login")
    return
  }

  next()
})

export default router
