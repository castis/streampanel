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

const storage = (name, state, cb) => {
    const hydrateResult = hydrate(name, state)
    if (cb) {
        hydrateResult.then(cb)
    }
    return state
}

export { localforage, storage }
