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
      this.setBaseUrl()
      this.addListeners()
    });
  }

  setBaseUrl() {
    this.appBaseUrlObject = new URL(this.appBaseUrl)
    this.appBaseUrlObject.pathname = "connect"
    this.appBaseUrlObject.searchParams.set('redirect_url', this.authRedirectUrl)
    this.appBaseUrlObject.searchParams.set('popout', true)
  }

  triggerAfterSignIn(userParams) {
    this.afterSignInCallback({...userParams})
  }

  addListeners() {
    this.el.addEventListener('click', () => {
      this.sodakitWindow = window.open(this.appBaseUrlObject, 'sodakitWindow', 'height=500,width=500')
    })

    window.addEventListener("message", (event) => {
      if (event.origin !== this.appBaseUrlObject.origin)
        return


      if (event.data.event_name == "after_signin") {
        this.triggerAfterSignIn(event.data)
      }
    }, false);

  }
}
