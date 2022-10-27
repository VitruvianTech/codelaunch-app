<template>
  <header>
    <div class="wrapper">
      <div>
        <div>
          <!-- <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fill-rule="evenodd">
              <path
                d="M10 0h12a10 10 0 0110 10v12a10 10 0 01-10 10H10A10 10 0 010 22V10A10 10 0 0110 0z"
                fill="#FFF"
              />
              <path
                d="M5.3 10.6l10.4 6v11.1l-10.4-6v-11zm11.4-6.2l9.7 5.5-9.7 5.6V4.4z"
                fill="#555AB9"
              />
              <path
                d="M27.2 10.6v11.2l-10.5 6V16.5l10.5-6zM15.7 4.4v11L6 10l9.7-5.5z"
                fill="#91BAF8"
              />
            </g>
          </svg> -->
          <NuxtLink to="/">
            <img width="32" src="/icon.png" />
          </NuxtLink>
        </div>
        <ul>
          <li>
            <NuxtLink to="/admin/tasks">Tasks</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/components">Components</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/users">Users</NuxtLink>
          </li>
        </ul>
      </div>
      <div style="display:table; float: right; line-height: 1;">
        <div v-if="$auth0.is('member')" style="display: table-cell; vertical-align: middle; padding-right: .5em; font-size: .9em;">
          <img :src="$auth0.user.value.picture" width="32" height="32" style="border-radius: 50%; border: solid #c0c0c0 1px; top: .125em;" />
        </div>
        <div v-if="$auth0.is('member')" style="display: table-cell; vertical-align: middle; padding-right: 1.5em; font-size: .9em; line-height: 1;">
          <strong>{{$auth0.user.value.name}}</strong>
        </div>
        <div style="display: table-cell; vertical-align: middle;">
          <my-button :disabled="$auth0.authenticating.value" size="small" @click="logout" label="Log out" v-if="$auth0.is('member')" />
          <my-button :disabled="$auth0.authenticating.value" primary size="small" @click="refresh" label="Refresh" v-if="$auth0.is('member')" />
          <my-button :disabled="$auth0.authenticating.value" primary size="small" @click="login" label="Log in" v-if="$auth0.is('guest')" />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
// import MyButton from './Button.vue'

// defineEmits(['login', 'logout', 'createAccount'])

// const login = () => {
//   useNuxtApp().$auth0.loginWithPopup()
// }

// const logout = () => {
//   useNuxtApp().$auth0.logout({
//     returnTo: window.location.origin
//   })
// }

// const refresh = () => {
//   useNuxtApp().$auth0.refresh(() => {
//     // window.location.reload()
//   })
// }
</script>

<script>
import MyButton from './Button.vue';

export default {
  name: 'my-header',

  components: { MyButton },

  emits: ['login', 'logout', 'createAccount'],

  methods: {
    login() {
      this.$auth0.loginWithPopup()
      // this.$auth0.loginWithPopup(() => this.$router.go(0))
      // this.$auth0.loginWithRedirect({
      //   appState: {
      //     targetUrl: useRoute().name
      //   }
      // })
    },
    logout() {
      const $auth0 = this.$auth0

      $auth0.logout({
        returnTo: window.location.origin
      })
    },
    refresh() {
      this.$auth0.refresh(() => {
        // window.location.reload()
      })
    }
  }
};
</script>

<style scoped lang="scss">
header {
  position: relative;
  z-index: 2;
  overflow: hidden;
}

a, nuxtlink {
  text-decoration: none;
  color: #8FB8DE;
  position: relative;
  transition: all .2s ease-out;

  &:hover {
    filter: brightness(1.2);
  }

  ul & {
    &:after {
      content: '';
      position: absolute;
      top: 100%;
      left: 0;
      height: 2px;
      width: 0;
      margin-top: 3px;
      background: #35C1B8;
      transition: all .2s ease-out;
    }
  }
}

.router-link-active {
  filter: brightness(1.2);

  &:after {
    width: 100%;
  }
}

.wrapper {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #202225;
  min-height: 80px;
  color: #efefef;
}

.wrapper > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

svg {
  display: inline-block;
  vertical-align: top;
}

h1 {
  font-weight: 900;
  font-size: 20px;
  line-height: 1.75;
  margin: 0 .35em;
  display: inline-block;
  vertical-align: top;
  color: #f0f0f0;
  font-style: italic;
  -webkit-text-fill-color: #f0f0f0;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #c0c0c0;
  /* filter: drop-shadow(1px 1px 1px #777); */
  opacity: .9;
}

img {
  position: relative;
  top: 0.25em;
}

button + button {
  margin-left: 10px;
}

ul {
  margin: 0 1em;
  padding: 0;
}

ul li {
  display: inline-block;
  margin: 0 .5em;
}
</style>
