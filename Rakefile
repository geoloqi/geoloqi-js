begin
  require 'jasmine'
  load 'jasmine/tasks/jasmine.rake'
rescue LoadError
  task :jasmine do
    abort "Jasmine is not available. In order to run jasmine, you must: (sudo) gem install jasmine"
  end
end

desc "Build a new version of geoloqi.js"
task :build
  # 1. Read version variable In geoloqi-client.js
  # 2. Read version variable in reciver.js
  # 3. Take the hash of the last git commit add it into var build_version = "" in geoloqi-client.js and receiver.js
  # 4. Concatinate and minify a new version to geoloqi.min.js and versions/geoloqi-VERSION.min.js
end