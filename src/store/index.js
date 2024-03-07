import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    app,
    settings,
    user,
    
    projects: {
      state: {
        completedProjects: []
      },
      mutations: {
        setCompletedProjects(state, projects) {
          state.completedProjects = projects;
        }
      },
      actions: {
        updateCompletedProjects({ commit }, projects) {
          commit('setCompletedProjects', projects);
        }
      }
    }
  },
  getters
})

export default store
