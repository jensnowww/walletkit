# Sodakit-sdk
Use to login on Sodakit using your solana wallet.


## Installation
Add `solanaWeb3` and `Sodakit` to your html.
```

<head>
...
  <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.js"> </script>
  <script src="https://unpkg.com/sodakit-sdk@latest/index.js"></script>
</head>
```

## Usage
```
  ...
  <script>
    new Sodakit({
      el: "#sign-in-button-id",
      app_id: "sodakit-application-id",
      auth_url: "your-authentication-url"
    })
  </script>
</head>
<body>

  <button id="sign-in-button-id">
    Connect Wallet
   </button>
</body>
```


## Support
- Phantom Web
- Phantom Mobile
- Phantom Ledger
