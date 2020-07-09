import localforage from 'localforage'
import { create } from 'mobx-persist'

localforage.config({
  driver: localforage.LOCALSTORAGE,
  name: 'streamPanel',
})

const hydrate = create({
  storage: localforage,
  jsonify: true,
})

const storage = (name, state, callback = () => {}) => {
  hydrate(name, state).then(callback)
  return state
}

export { localforage, storage }
