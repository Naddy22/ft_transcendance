
# SSL Setup for HTTPS Support (using a self-signed certificate)

> Ensure all communications are secure by enabling HTTPS with a self-signed SSL certificate.


## Generate a Self-Signed Certificate

1. Run the following command to create a certificate:

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```
> key.pem: Private key file.  
> cert.pem: Certificate file.  

2. Move the files to your project directory:

```bash
mv key.pem cert.pem ft_transcendance-backend/
```

## Enable HTTPS in Sinatra

Update app.rb:

```rb
require 'webrick/https'

# Create an HTTPS server
set :server_settings, {
  SSLEnable: true,
  SSLVerifyClient: OpenSSL::SSL::VERIFY_NONE,
  SSLPrivateKey: OpenSSL::PKey::RSA.new(File.open('key.pem')),
  SSLCertificate: OpenSSL::X509::Certificate.new(File.open('cert.pem'))
}

get '/' do
  'Secure connection over HTTPS'
end
```

## Run the Server

Run the app:

```bash
ruby app.rb
```

Visit your app at https://localhost:4567.

> Note: Your browser will warn about the self-signed certificate. You can proceed safely for development purposes.

---
