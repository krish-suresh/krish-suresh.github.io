# WEBrick raises HTTPStatus::PartialContent for range requests, skipping
# Jekyll's cache headers. Caching these responses can make Chrome send If-Range,
# which WEBrick 1.9.2 incorrectly answers with 304 and stalls video playback.
# Apply Jekyll's configured cache headers to range responses in local previews.
if Jekyll.env == "development"
  require "jekyll/commands/serve/servlet"

  module LocalPreviewCacheHeaders
    def do_GET(request, response)
      super
    ensure
      response.header.merge!(@headers) if request["range"]
    end
  end

  Jekyll::Commands::Serve::Servlet.prepend(LocalPreviewCacheHeaders)
end
