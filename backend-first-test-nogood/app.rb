
# Dir.chdir(File.expand_path(__dir__))
require 'bundler/setup'	# Load Bundler
Bundler.require			# Require all gems from Gemfile

require 'sinatra'
require 'json'

get '/' do
  { message: 'Welcome to ft_transcendance' }.to_json
end

# get '/' do
# 	"Hello, world!"
# end
