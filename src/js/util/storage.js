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

export { localforage, hydrate }
