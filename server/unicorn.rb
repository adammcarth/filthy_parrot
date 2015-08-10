# set path to app that will be used to configure unicorn,
# note the trailing slash in this example
@dir = "/var/www/filthyparrot.net/"

worker_processes 2
working_directory @dir

timeout 30

# Specify path to socket unicorn listens to,
# we will use this in our nginx.conf later
listen "#{@dir}server/tmp/sockets/unicorn.sock", :backlog => 64

# Set process id path
pid "#{@dir}server/tmp/pids/unicorn.pid"

# Set log file paths
stderr_path "#{@dir}server/log/unicorn.stderr.log"
stdout_path "#{@dir}server/log/unicorn.stdout.log"
