
# HTTP Server (Pure Ruby HTTP Server)

require "webrick"
require_relative "routes"

server = WEBrick::HTTPServer.new(
  Port: 3000,
  DocumentRoot: ".",
  SSLEnable: true, # Required for HTTPS
  SSLPrivateKey: OpenSSL::PKey::RSA.new(File.read("certs/server.key")),
  SSLCertificate: OpenSSL::X509::Certificate.new(File.read("certs/server.crt"))
)

server.mount_proc "/register" do |req, res|
  res.body = Routes.handle_register(req)
end

server.mount_proc "/login" do |req, res|
  res.body = Routes.handle_login(req)
end

server.mount_proc "/tournament" do |req, res|
  res.body = Routes.handle_tournament(req)
end

trap "INT" do
  server.shutdown
end

server.start

# Why WEBrick?
# It’s built into Ruby (no need for external libraries).
# Allows custom request handling.
# Supports HTTPS (required by the project).
