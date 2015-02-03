# Require all the libraries listed in the Gemfile [SRC: ./Gemfile]
require "bundler"
Bundler.require :default
require "json"
require "date"

class FilthyParrot < Sinatra::Base
  # Basic environment configuration settings
  set :root, File.dirname(__FILE__)
  set :views, Proc.new { File.join(root, "views") }
  set :environment, ENV["RACK_ENV"]
  set :sprockets, Sprockets::Environment.new(root)
  set :assets_prefix, "/assets"
  set :digest_assets, true
  set :orchestrate_api_key, "22edabfa-df07-400c-ba43-4d3444640600" # this will be changed, don't bother.

  # Error handling for development
  configure :development do
    Bundler.require :development
    use BetterErrors::Middleware
    BetterErrors.application_root = __dir__
  end
  
  configure do
    # Setup Sprockets [Asset pipeline]
    sprockets.append_path File.join(root, "assets", "stylesheets")
    sprockets.append_path File.join(root, "assets", "javascripts")
    sprockets.append_path File.join(root, "assets", "images")

    # Configure Sprockets::Helpers
    Sprockets::Helpers.configure do |config|
      config.environment = sprockets
      config.prefix      = assets_prefix
      config.digest      = digest_assets
      config.public_path = public_folder
      config.debug       = true if development?
    end
  end

  # Helper methods for use in view templates
  helpers do
    include Sprockets::Helpers

    def page_title
      defined?(@page_title) ?
        @page_title.to_s + " |" : nil
    end

    def render(*args)
      if args.first.is_a?(Hash) && args.first.keys.include?(:partial)
        return erb "_#{args.first[:partial]}".to_sym, :layout => false
      else
        super
      end
    end

    def authenticate!

    end
  end

  #############################################################
  # MAIN WEB APPLICATION LOGIC ################################
  #############################################################

  get "/" do
    available_scenarios = ["1", "2", "3", "4"] # refer to index view template
    if params[:s] && available_scenarios.include?(params[:s])
      # specific scenario has been requested in the URL, so set it.
      @scenario = params[:s]
    else
      # pick a random scenario from the defined `available_scenarios` array above
      @scenario = available_scenarios.sample
    end

    if params[:n]
      # the person's name has been specified in the URL, so use it! :)
      @name = params[:n]
    else
      @name = "Oke" # fallback (south african slang for "dude")
    end

    erb :index
  end

  post "/submit" do
    # Check the bare minimum parameters exist
    if params["tracks"]["1"] == "" || params["tracks"]["1"] == nil || params["tracks"]["2"] == "" || params["tracks"]["2"] == nil || params["tracks"]["3"] == "" || params["tracks"]["3"] == nil ||  params["name"] == "" || params["name"] == nil || params["tagline"] == "" || params["tagline"] == nil
      halt 400
    end

    # Generate the 4 digit serial to identify the track list (used to record and display results)
    serial = rand(36**4).to_s(36)
    # Save the track list to the database. Will throw a 500 error if something goes wrong.
    database = Orchestrate::Client.new(settings.orchestrate_api_key)
    database.put(:track_lists, :"#{serial}", {
      "name" => params["name"],
      "scenario" => params["tagline"],
      "track_1" => params["tracks"]["1"],
      "track_1_notes" => params["trackNotes"]["1"],
      "track_2" => params["tracks"]["2"],
      "track_2_notes" => params["trackNotes"]["2"],
      "track_3" => params["tracks"]["3"],
      "track_3_notes" => params["trackNotes"]["3"],
      "created_at" => Time.now,
      "updated_at" => Time.now
    })
    
    # Render a JSON page for the front end javascript application to interpret
    content_type :json
    { :success => 1, :serial => serial }.to_json
  end

  get "/answers/:serial" do
    track_lists = Orchestrate::Application.new(settings.orchestrate_api_key)["track_lists"]
    @submission = track_lists[params[:serial]]
    if @submission
      @page_title = "#{@submission['name']}'s Answers"
      erb :show
    else
      halt 404
    end
  end

  # Backend stuff
  get "/feed" do
    authenticate!

    unordered_submissions = Orchestrate::Application.new(settings.orchestrate_api_key)["track_lists"]
    @submissions = unordered_submissions.search("*").order(:updated_at, :desc).find
    @latest_submission = @submissions.first[1]
    erb :"backend/feed", :layout => :"backend/layout"
  end

  get "/feed/api" do
    authenticate!

    output = "{}"

    if params[:load]
      track_lists = Orchestrate::Application.new(settings.orchestrate_api_key)["track_lists"]
      submission = track_lists[params[:load]]
      output_hash = { "id" => submission.id.split("/")[1], "name" => submission[:name], "scenario" => submission[:scenario],
                      "track_1" => submission[:track_1], "track_1_notes" => submission[:track_1_notes],
                      "track_2" => submission[:track_2], "track_2_notes" => submission[:track_2_notes],
                      "track_3" => submission[:track_3], "track_3_notes" => submission[:track_3_notes],
                      "created_at" => submission[:created_at], "updated_at" => submission[:updated_at]
                    }
      output = output_hash.to_json
    end

    if params[:search]
      if params[:search] == ""
        params[:search] = "*"
      end

      track_lists = Orchestrate::Application.new(settings.orchestrate_api_key)["track_lists"]
      if params[:search] == "*"
        results = track_lists.search(params[:search]).order(:updated_at, :desc).find # order the entire list by date
      else
        results = track_lists.search(params[:search]).find # let orchestrate order by search result score
      end
      output_hash = {}

      results.each do |ref, submission|
        output_hash[submission.id.split("/")[1]] = { "name" => submission[:name], "scenario" => submission[:scenario],
                                                     "track_1" => submission[:track_1], "track_1_notes" => submission[:track_1_notes],
                                                     "track_2" => submission[:track_2], "track_2_notes" => submission[:track_2_notes],
                                                     "track_3" => submission[:track_3], "track_3_notes" => submission[:track_3_notes],
                                                     "created_at" => submission[:created_at], "updated_at" => submission[:updated_at]
                                                    }
      end

      output = output_hash.to_json
    end

    # Output the JSON data
    content_type :json
    "#{output}"
  end

  get "/login" do
    erb :"backend/login", :layout => :"backend/layout"
  end

  post "/login" do

  end

end