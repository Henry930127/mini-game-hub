import { createRouter, createWebHistory } from "vue-router"

import Home from "../views/Home.vue"
import Game from "../views/Game.vue"
import GameDetail from "../views/GameDetail.vue"
import Leaderboard from "../views/Leaderboard.vue"
import Login from "../views/Login.vue"
import Register from "../views/Register.vue"
import Profile from "../views/Profile.vue"

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !token) {
  next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  return
  }

  next()
})

export default router