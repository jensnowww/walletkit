class Sodakit {
  constructor({ el, app_id, auth_url = null, ledger_suppport = true, injectCss = true}) {
    this.el_selector = el
    this.app_id = app_id
    this.auth_url = auth_url
    this.ledger_suppport = ledger_suppport
    this.isLedger = false
    this.sodakit_url = "https://kit.sodalabs.com/api/v1"
    this.rpc_endpoint = "https://spring-autumn-log.solana-mainnet.quiknode.pro"
    this.injectCss = injectCss
    this.init()
  }

  init() {
    document.addEventListener("DOMContentLoaded", (event) => {
      this.el = document.querySelector(this.el_selector)
      this.getSignatureMessage()
      this.insertLedgerAlertDiv()
      this.addListeners()
    });
  }

  addListeners() {
    const container = document.querySelector('.sodakit-signin-container')
    const confirmButton = container.querySelector('#sodakit-signin-confirm')
    const ledgerSwitch = container.querySelector('#sodakit-is-ledger-input')

    this.el.addEventListener("click", () => {
      if (this.ledger_suppport) {
        container.style.display = "flex"
      } else {
        this.phantomConnect()
      }
    })

    ledgerSwitch.addEventListener("change", (e) => {
      this.isLedger = e.currentTarget.checked
    })

    confirmButton.addEventListener('click', () => {
      container.style.display = "none"
      this.phantomConnect()
    })

  }

  insertLedgerAlertDiv() {

    // Inject CSS
    document.getElementsByTagName("head")[0].innerHTML += "  <link rel='stylesheet' href='./index.css'>";

    // Inject
    this.el.insertAdjacentHTML('afterend',
      `
      <div class='sodakit-signin-container' style="display: none">
        <div class="sodakit-signin-modal">
          <div class="sodakit-signin-form-container">
            <label class="sodakit-switch">
              <input type="checkbox" id="sodakit-is-ledger-input">
              <span class="sodakit-slider round"></span>
            </label>
            <span class="sodakit-is-ledger-label">
              Are you using ledger?
            </span>
          </div>
          <button id="sodakit-signin-confirm">
            Confirm
          </button>

        </div>
      </div>
      `
    )
  }

  async getSignatureMessage() {
    const url = `${this.sodakit_url}/applications/${this.app_id}`

    try {
      const response = await fetch(url)
      const json = await response.json()
      if ( json.signature_message ) {
        this.signatureMessage = json.signature_message
      }
    } catch(er) {
      console.warn("Something went wrong when fetching application signature message with app_id: ", this.app_id)
    }
  }

  async phantomConnect() {
    if (!window.solana) return // ADD error handling phantom isn't installed
    await window.solana.connect()
    if (this.signatureMessage && (mobileCheck() || window.solana.isConnected)) {
      this.el.classList.add('connected')
      this.el.classList.add('isLoading')
      this.publicKey = window.solana.publicKey.toString()

      try {
        if ( this.isLedger ) {
          await this.sendSolTransaction()
        } else {
          await this.getWalletSignature()
        }
      } catch (er) {
        console.warn(er)
        this.el.classList.remove('isLoading')
      }

      if ( this.signatureMessage ) {
        await this.authenticateUser()
        if (this.auth_url) {
          this.redirectToSignIn()
        }
        this.el.classList.add('authenticated')
      }
      this.el.classList.remove('isLoading')

    } else {
      //
      return
    }
  }

  redirectToSignIn() {
    let url = new URL(this.auth_url)
    const { authentication_token, identifier } = this.userAuth
    const walletAddress = this.userAuth.wallet_addresses[0]
    console.log(this.userAuth)
    url.searchParams.set('walletkit_authentication_token', authentication_token)
    url.searchParams.set('walletkit_user_id', identifier)
    url.searchParams.set('wallet_address', walletAddress)
    window.location.href = url.toString()
  }

  async authenticateUser() {
    const authUrl = `${this.sodakit_url}/users/authenticate`
    const data = {
      "public_key": this.publicKey,
      "signature": this.signatureString,
      "is_transaction": this.isLedger,
      "app_id": this.app_id,
    }
    const authResponse = await fetch(authUrl, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const json = await authResponse.json()
    this.userAuth = json
  }

  async sendSolTransaction() {
    const { Connection, Transaction, SystemProgram} = solanaWeb3
    const publicKey = window.solana.publicKey
    const connection = new Connection(
      this.rpc_endpoint,
      {
        confirmTransactionInitialTimeout:  60 * 10 * 1000
      }
    );

    const transaction = new Transaction({feePayer: publicKey}).add(
      SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 1,
      })
    );
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash
    const { signature } = await window.solana.signAndSendTransaction(transaction);
    const confirmTransaction = await connection.confirmTransaction(signature, 'finalized')

    if (signature) {
      this.signatureString = signature
    }
  }

  async getWalletSignature() {
    const encodedMessage = new TextEncoder().encode(this.signatureMessage);
    const { signature } = await window.solana.signMessage(encodedMessage, "utf8")
    this.signatureString = signature.join(",")
  }
}

window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};