const script = document.createElement('script')
script.src = 'https://www.googletagmanager.com/gtag/js?id=UA-97850133-2'
script.async = true
// document.querySelector('body').appendChild(script)

window.dataLayer = window.dataLayer || []

function gtag() {
    dataLayer.push(arguments)
}

gtag('js', new Date())
gtag('config', 'UA-97850133-2')

export default gtag
