class WalletKit {
  constructor({ el, appId, appBaseUrl, authRedirectUrl, afterSignInCallback }) {
    this.elSelector = el
    this.appId = appId
    this.appBaseUrl = appBaseUrl
    this.authRedirectUrl = authRedirectUrl
    this.afterSignInCallback = afterSignInCallback
    this.init()
  }

  init() {
    document.addEventListener("DOMContentLoaded", (event) => {
      window.walletkit = this
      this.el = document.querySelector(this.elSelector)
      this.addListeners()
    });
  }

  triggerAfterSignIn(userParams) {
    this.afterSignInCallback(userParams)
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
