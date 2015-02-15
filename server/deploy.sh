# `deploy.sh` by Adam McArthur
# Deploys a new copy of a GitHub repository on a server.
# Warning: The current user must be able to use "sudo" without a password.
# (http://askubuntu.com/questions/235084/how-do-i-remove-ubuntus-password-requirement#answer-235088)

##### SETTINGS [Change Me] #####

app_name="The Filthy Parrot"
app_dir="/var/www"
github_username="adammcarth"
git_repo="filthy_parrot"

log_files="/var/www/server/logs"
archive_log_files= "/var/logs_archive"
app_install_commands="gem install bundler; bundle install"
app_terminate_commands="cat /var/www/server/tmp/pids/unicorn.pid | xargs kill -QUIT"
app_startup_commands="ORCHESTRATE_API_KEY=$ORCHESTRATE_API_KEY bundle exec unicorn config.ru -c /var/www/server/unicorn.rb -E production -D"
post_startup_commands="sudo scp '$app_dir/server/nginx.conf' /etc/nginx/nginx.conf; sudo service nginx restart"

##### SCRIPT [Leave Me] ######

bold=`tput bold`
Red='\033[0;31m'
Yel='\033[1;33m'
Gre='\033[0;32m'
RCol='\033[0m'
if [ -z $GIT_BRANCH ]; then git_branch="master"; else git_branch=$GIT_BRANCH; fi
app_old="$app_dir\_old"
app_pending="$app_dir\_pending"
app_failed="$app_dir\_failed"

echo "${bold}==== DEPLOYMENT STARTING ===="
echo

echo "${bold}01. Cleaning '/var' directory..."
cd $app_dir
cd ../
sudo rm -r -f $app_pending

echo "${bold}02. Downloading latest version from $git_repo:$git_branch..."
sudo git clone https://github.com/$github_username/$git_repo.git
cd ./$git_repo
git checkout -b $git_branch
cd ../

echo "${bold}03. Unpacking files to temporary '$app_pending' directory..."
sudo mv $git_repo $app_pending

echo "${bold}04. Repairing permissions for '$app_pending'..."
sudo chown -R $(whoami):$(whoami) $app_pending

echo "${bold}05. Installing dependancies for new deployment..."
cd $app_pending
$app_install_commands

echo "${bold}06. Terminating current application..."
cd $app_dir
$app_terminate_commands

echo "${bold}07. Archiving old log files..."
sudo mv $log_files "$archive_log_files/$(date +'%Y')/$(date +'%m')/$(date +'%d')/$(date +'%H')-$(date +'%M')/$(date +'%N')"

echo "${bold}08. Replacing '$app_dir' with '$app_pending'..."
sudo mv $app_dir $app_old
sudo mv $app_pending $app_dir

echo
echo "${bold}..."
echo

echo "${bold}09. Starting new application..."
cd $app_dir
if $app_startup_commands; then
	sudo rm -r $app_old
	$post_startup_commands
	echo "${bold}==== ${Gre}[APPLICATION NOW RUNNING!] $app_name has been deployed successfully :) ${RCol}===="
else
	echo "  ${bold}${Red}[FAIL!] Couldn't start the application (${RCol}#1${Red}). ${Yel}Retrying..."
	if $app_startup_commands; then
		sudo rm -r $app_old
		$post_startup_commands
		echo "${bold}==== ${Gre}[APPLICATION NOW RUNNING!] $app_name has been deployed successfully :) ${RCol}===="
	else
		echo "  ${bold}${Red}[FAIL!] Couldn't start the application (${RCol}#2${Red}). ${Yel}Reverting to previous build..."
		sudo mv $app_dir $app_failed
		sudo mv $app_old $app_dir
		cd $app_dir
		if $app_startup_commands; then
			echo "${bold}${Yel}...Reverted to previous build successfully. The latest build could not be started, and is likely due to a runtime error on startup."
			exit 0
		else
			echo "${bold}${Red}[Fatal Error!] Neither version of the application could be started. This is a most likely an issue on the server side, and requires immediate attention. No application is currently running."
			exit 0
		fi
	fi
fi