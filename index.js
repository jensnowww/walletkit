class WalletKit {
  constructor({ el, appId, appBaseUrl, authRedirectUrl }) {
    this.elSelector = el
    this.appId = appId
    this.appBaseUrl = appBaseUrl
    this.authRedirectUrl = authRedirectUrl
    this.init()
  }

  init() {
    document.addEventListener("DOMContentLoaded", (event) => {
      this.el = document.querySelector(this.elSelector)
      this.addListeners()
    });
  }


  addListeners() {
    this.el.addEventListener('click', () => {
      let url = new URL(this.appBaseUrl)
      url.pathname = "connect"
      url.searchParams.set('redirect_url', this.authRedirectUrl)
      url.searchParams.set('popout', true)
      this.sodakitWindow = window.open(url, 'sodakitWindow', 'height=500,width=500')
    })
  }
}
